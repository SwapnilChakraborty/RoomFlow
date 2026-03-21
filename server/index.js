const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dns = require('dns');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Override DNS for MongoDB Atlas resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const allowedOrigins = [
    'https://hotel-mangment-ten.vercel.app',
    'https://roomflow-1rs6.onrender.com',
    'http://localhost:5173',
    'http://localhost:5001'
];

const app = express();

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per 15 mins
    message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15, // Limit login attempts to 15 per 15 mins
    message: { error: 'Too many login attempts, please try again after 15 minutes.' }
});

app.use('/api/', globalLimiter);
app.use('/api/staff-login', authLimiter);
app.use('/api/customer-login', authLimiter);
const isMockMode = false; // Disable mock mode for production
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app') || origin.includes('onrender.com')) {
                callback(null, true);
            } else {
                console.warn(`CORS blocked for origin: ${origin}`);
                callback(null, false); // Block but don't throw an error that causes 500
            }
        },
        methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app') || origin.includes('onrender.com')) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked for origin: ${origin}`);
            callback(null, false); // Block but don't throw an error that causes 500
        }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        await ensureAdminExists();
    })
    .catch(err => {
        console.error('CRITICAL: MongoDB connection error:', err.message);
        console.error('Shutting down...');
        process.exit(1);
    });

// Helper to ensure at least one admin exists
async function ensureAdminExists() {
    try {
        const count = await Staff.countDocuments();
        if (count === 0) {
            const adminUsername = process.env.ADMIN_USERNAME || 'admin';
            const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
            
            console.log(`No staff found in database. Creating default admin: ${adminUsername}...`);
            const admin = new Staff({
                username: adminUsername,
                password: adminPassword,
                name: 'System Admin',
                role: 'Admin'
            });
            await admin.save();
            console.log(`Default admin created: ${adminUsername} / (hidden)`);
        }
    } catch (err) {
        console.error('Error ensuring admin exists:', err.message);
    }
}

// Schemas
const StaffSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'Staff', enum: ['Admin', 'Staff'] },
    shiftStart: { type: String, default: '09:00' }, // 24h format
    shiftEnd: { type: String, default: '18:00' },
    weeklyOff: { type: String, default: 'Sunday' },
    status: { type: String, default: 'Off Duty', enum: ['Active', 'On Break', 'Off Duty'] },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
StaffSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

// Method to check password
StaffSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Staff = mongoose.model('Staff', StaffSchema);

// Middleware for authentication
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
}

function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
        }
        next();
    };
}

const RoomSchema = new mongoose.Schema({
    roomNumber: { type: String, unique: true, required: true },
    type: { type: String, required: true },
    status: { type: String, default: 'Ready', enum: ['Ready', 'Occupied', 'Cleaning', 'Maintenance'] },
    currentGuest: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    floor: { type: Number, required: true },
    lastCleaned: { type: String, default: 'Just now' }
});

const Room = mongoose.model('Room', RoomSchema);

const CustomerSchema = new mongoose.Schema({
    customerID: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    checkIn: { type: Date, default: Date.now },
    checkOut: { type: Date }
});

const Customer = mongoose.model('Customer', CustomerSchema);


const OrderSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    items: [{
        name: String,
        price: Number,
        quantity: Number
    }],
    total: Number,
    status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Preparing', 'Delivered', 'Completed', 'Cancelled'] },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    startedAt: { type: Date },
    completedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);

const ServiceRequestSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    type: { type: String, required: true }, // 'housekeeping', 'laundry', 'maintenance'
    details: String,
    status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Preparing', 'Delivered', 'Completed', 'Cancelled'] },
    priority: { type: String, default: 'normal', enum: ['low', 'normal', 'high', 'urgent'] },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    startedAt: { type: Date },
    completedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema);

const LeadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    company: { type: String },
    status: { type: String, default: 'New', enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'] },
    source: { type: String, default: 'Website' },
    value: { type: Number, default: 0 },
    notes: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    createdAt: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', LeadSchema);

const ChatMessageSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    sender: { type: String, enum: ['guest', 'admin'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

const SystemSettingsSchema = new mongoose.Schema({
    crmEnabled: { type: Boolean, default: true },
    hotelName: { type: String, default: 'RoomFlow Premium' },
    hotelId: { type: String, default: 'RF-2026-01' },
    currency: { type: String, default: 'INR' },
    taxRate: { type: Number, default: 12 },
    googleReviewUrl: { type: String, default: '' }
});

const SystemSettings = mongoose.model('SystemSettings', SystemSettingsSchema);

const ReviewSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    guestName: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    requestId: { type: mongoose.Schema.Types.ObjectId }, // Link to ServiceRequest or Order
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', ReviewSchema);

// Helper to broadcast stats
async function broadcastStats() {
    try {
        const totalRooms = await Room.countDocuments();
        const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
        const stats = {
            totalRooms,
            occupiedRooms,
            cleaningRooms: await Room.countDocuments({ status: 'Cleaning' }),
            maintenanceRooms: await Room.countDocuments({ status: 'Maintenance' }),
            totalGuests: await Customer.countDocuments(),
            occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0
        };
        io.emit('stats_update', stats);
    } catch (err) {
        console.error('Error broadcasting stats:', err.message);
    }
}

// Order Routes
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();

        io.emit('admin_activity', {
            id: order._id.toString(),
            room: order.roomNumber,
            type: 'order',
            details: order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
            total: order.total,
            status: order.status,
            time: order.createdAt
        });

        // Live Notification
        io.emit('new_notification', {
            id: Date.now(),
            role: 'admin',
            title: 'New Room Order',
            message: `Room ${order.roomNumber}: ${order.items.length} items ordered`,
            type: 'order',
            time: new Date()
        });

        res.json({ message: 'Order placed successfully', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Service Request Routes
app.post('/api/service-requests', async (req, res) => {
    try {
        const request = new ServiceRequest(req.body);
        await request.save();

        io.emit('admin_activity', {
            id: request._id.toString(),
            room: request.roomNumber,
            type: 'service',
            details: request.details,
            priority: request.priority,
            status: request.status,
            time: request.createdAt,
            serviceType: request.type
        });

        // Live Notification
        io.emit('new_notification', {
            id: Date.now(),
            role: 'admin',
            title: 'New Service Request',
            message: `Room ${request.roomNumber}: ${request.type.charAt(0).toUpperCase() + request.type.slice(1)} requested`,
            type: 'service',
            time: new Date()
        });

        res.json({ message: 'Request submitted successfully', request });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        status: 'ok',
        service: 'RoomFlow API',
        database: dbStatus,
        connectionState: mongoose.connection.readyState
    });
});

// Room Routes
app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await Room.find().populate('currentGuest').sort({ roomNumber: 1 });
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/rooms', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { roomNumber, type, floor } = req.body;
        
        // Check if room already exists
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({ error: `Room ${roomNumber} already exists` });
        }

        const room = new Room({
            roomNumber,
            type,
            floor,
            status: 'Ready'
        });
        await room.save();
        
        io.emit('room_added', room);
        broadcastStats();
        
        res.json({ message: 'Room created successfully', room });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/rooms/:id', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ error: 'Room not found' });
        
        if (room.status === 'Occupied') {
            return res.status(400).json({ error: 'Cannot delete an occupied room' });
        }

        await Room.findByIdAndDelete(req.params.id);
        
        io.emit('room_deleted', { roomId: req.params.id, roomNumber: room.roomNumber });
        broadcastStats();
        
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Allot Room Route
app.post('/api/allot-room', authenticateToken, async (req, res) => {
    const { roomNumber, guestName, phone, checkIn, checkOut } = req.body;
    try {
        const room = await Room.findOne({ roomNumber });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        if (room.status !== 'Ready') return res.status(400).json({ error: 'Room is not ready' });

        const customerID = 'CUST' + Math.floor(1000 + Math.random() * 9000);
        const customer = new Customer({ customerID, name: guestName, phone, room: room._id, checkIn, checkOut });
        await customer.save();

        room.status = 'Occupied';
        room.currentGuest = customer._id;
        await room.save();

        io.emit('room_status_changed', { roomNumber, status: 'Occupied' });
        broadcastStats();

        res.json({ message: 'Room allotted successfully', customerID, customer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check-out Route
app.post('/api/checkout', authenticateToken, async (req, res) => {
    const { roomNumber } = req.body;
    try {
        const room = await Room.findOne({ roomNumber }).populate('currentGuest');
        if (!room) return res.status(404).json({ error: 'Room not found' });
        
        if (room.currentGuest) {
            await Customer.findByIdAndDelete(room.currentGuest._id);
        }
        room.status = 'Cleaning';
        room.currentGuest = null;
        await room.save();

        // Clear chat history in DB
        await ChatMessage.deleteMany({ roomNumber });

        io.emit('room_status_changed', { roomNumber, status: 'Cleaning' });
        io.emit('guest_checkout', { roomNumber });
        
        // Create a persistent service request for housekeeping
        const housekeepingReq = new ServiceRequest({
            roomNumber: roomNumber,
            type: 'housekeeping',
            details: 'Housekeeping Required',
            priority: 'High',
            status: 'Pending',
            createdAt: new Date()
        });

        await housekeepingReq.save();

        io.emit('admin_activity', {
            id: housekeepingReq._id.toString(),
            room: roomNumber,
            type: 'service',
            details: housekeepingReq.details,
            priority: housekeepingReq.priority,
            status: housekeepingReq.status,
            time: housekeepingReq.createdAt,
            serviceType: housekeepingReq.type
        });

        // Live Notification for Admin & Staff
        io.emit('new_notification', {
            id: Date.now(),
            role: 'admin',
            title: 'New Service Request',
            message: `Room ${roomNumber}: Housekeeping Required`,
            type: 'service',
            time: new Date()
        });

        broadcastStats();

        res.json({ message: 'Checked out successfully.', room });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Room Status Route
app.post('/api/update-room-status', authenticateToken, async (req, res) => {
    const { roomNumber, status } = req.body;
    try {
        const room = await Room.findOne({ roomNumber });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        room.status = status;
        if (status === 'Ready') room.currentGuest = null;
        await room.save();

        io.emit('room_status_changed', { roomNumber, status });
        if (status === 'Cleaning') {
            const housekeepingReq = new ServiceRequest({
                roomNumber: roomNumber,
                type: 'housekeeping',
                details: 'Housekeeping Required',
                priority: 'High',
                status: 'Pending',
                createdAt: new Date()
            });

            await housekeepingReq.save();

            io.emit('admin_activity', {
                id: housekeepingReq._id.toString(),
                room: roomNumber,
                type: 'service',
                details: housekeepingReq.details,
                priority: housekeepingReq.priority,
                status: housekeepingReq.status,
                time: housekeepingReq.createdAt,
                serviceType: housekeepingReq.type
            });

            // Live Notification for Admin & Staff
            io.emit('new_notification', {
                id: Date.now(),
                role: 'admin',
                title: 'New Service Request',
                message: `Room ${roomNumber}: Housekeeping Required (Auto)`,
                type: 'service',
                time: new Date()
            });
        }
        broadcastStats();

        res.json({ message: `Room status updated to ${status}`, room });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Customer Login Route
app.post('/api/customer-login', async (req, res) => {
    let { customerID } = req.body;
    if (customerID) customerID = customerID.trim().toUpperCase();

    try {
        const customer = await Customer.findOne({ customerID }).populate('room');
        if (!customer) return res.status(404).json({ error: 'Invalid Customer ID' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stats Route
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const totalRooms = await Room.countDocuments();
        const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
        const cleaningRooms = await Room.countDocuments({ status: 'Cleaning' });
        const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });
        const totalGuests = await Customer.countDocuments();

        res.json({
            totalRooms,
            occupiedRooms,
            cleaningRooms,
            maintenanceRooms,
            totalGuests,
            occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Staff Login Route
app.post('/api/staff-login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const staff = await Staff.findOne({ username });

        if (!staff) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await staff.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Issue JWT
        const token = jwt.sign(
            { id: staff._id, username: staff.username, role: staff.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: staff._id,
                username: staff.username,
                name: staff.name,
                role: staff.role
            }
        });
    } catch (err) {
        console.error('Staff Login Error:', err);
        res.status(500).json({ error: 'Internal Server Error during login', message: err.message });
    }
});

// Staff Routes
app.get('/api/staff', authenticateToken, async (req, res) => {
    try {
        const staff = await Staff.find({}, '-password').sort({ name: 1 });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/staff', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    const { username, password, name, role, email, phone } = req.body;
    try {
        const existingStaff = await Staff.findOne({ username });
        if (existingStaff) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const staff = new Staff({
            username,
            password, // Hook will handle hashing
            name,
            role: role || 'Staff',
            email,
            phone
        });

        await staff.save();
        
        // Emit event for real-time updates
        io.emit('staff_added', { 
            id: staff._id, 
            name: staff.name, 
            role: staff.role 
        });

        res.status(201).json({ 
            message: 'Staff created successfully', 
            staff: { id: staff._id, username: staff.username, name: staff.name, role: staff.role } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Performance Stats for Admin
app.get('/api/admin/staff-performance-stats', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const staffList = await Staff.find({}, 'name role');
        const stats = await Promise.all(staffList.map(async (s) => {
            const completedRequests = await ServiceRequest.find({ 
                assignedStaff: s._id, 
                status: 'Completed' 
            });
            const completedOrders = await Order.find({ 
                assignedStaff: s._id, 
                status: 'Completed' 
            });

            const allTasks = [...completedRequests, ...completedOrders];
            const tasksCount = allTasks.length;

            let totalTime = 0;
            allTasks.forEach(t => {
                if (t.startedAt && t.completedAt) {
                    totalTime += (t.completedAt - t.startedAt) / (1000 * 60); // minutes
                }
            });

            const avgTime = tasksCount > 0 ? Math.round(totalTime / tasksCount) : 0;

            const reviews = await Review.find({ staffId: s._id });
            const avgRating = reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
                : "5.0";

            return {
                id: s._id,
                name: s.name,
                role: s.role,
                tasksCompleted: tasksCount,
                avgCompletionTime: `${avgTime}m`,
                rating: avgRating
            };
        }));

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Activity Feed Route
app.get('/api/activity', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const serviceRequests = await ServiceRequest.find().sort({ createdAt: -1 }).limit(10).lean();
        const orders = await Order.find().sort({ createdAt: -1 }).limit(10).lean();

        const activities = [
            ...serviceRequests.map(r => ({
                id: r._id.toString(),
                room: r.roomNumber,
                details: r.details,
                time: r.createdAt,
                type: 'service',
                status: r.status,
                priority: r.priority,
                serviceType: r.type
            })),
            ...orders.map(o => {
                const orderText = o.items && o.items.length > 0
                    ? o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
                    : `Order #${o._id.toString().substring(19)}`;
                return {
                    id: o._id.toString(),
                    room: o.roomNumber,
                    details: orderText,
                    time: o.createdAt,
                    type: 'order',
                    status: o.status,
                    total: o.total
                };
            }),
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);

        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Live Requests Route (all active items)
app.get('/api/requests/live', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const activeStatuses = ['Pending', 'In Progress', 'Preparing'];
        const serviceRequests = await ServiceRequest.find({ status: { $in: activeStatuses } }).sort({ createdAt: -1 }).lean();
        const orders = await Order.find({ status: { $in: activeStatuses } }).sort({ createdAt: -1 }).lean();

        const requests = [
            ...serviceRequests.map(r => ({
                id: r._id.toString(),
                room: r.roomNumber,
                details: r.details,
                time: r.createdAt,
                type: 'service',
                status: r.status,
                priority: r.priority,
                serviceType: r.type
            })),
            ...orders.map(o => {
                const orderText = o.items && o.items.length > 0
                    ? o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
                    : `Order #${o._id.toString().substring(19)}`;
                return {
                    id: o._id.toString(),
                    room: o.roomNumber,
                    details: orderText,
                    time: o.createdAt,
                    type: 'order',
                    status: o.status,
                    total: o.total
                };
            }),
        ].sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Guest Activity Route
app.get('/api/guest-activity/:roomNumber', async (req, res) => {
    const { roomNumber } = req.params;
    try {
        const activeStatuses = ['Pending', 'In Progress', 'Preparing'];
        const serviceRequests = await ServiceRequest.find({ 
            roomNumber, 
            status: { $in: activeStatuses } 
        }).sort({ createdAt: -1 }).limit(10).lean();

        const orders = await Order.find({ 
            roomNumber, 
            status: { $in: activeStatuses } 
        }).sort({ createdAt: -1 }).limit(10).lean();

        const activities = [
            ...serviceRequests.map(r => ({
                id: r._id.toString(),
                text: `${r.type.charAt(0).toUpperCase() + r.type.slice(1)} Request`,
                details: r.details,
                time: r.createdAt,
                type: 'service',
                status: r.status
            })),
            ...orders.map(o => {
                const itemSummary = o.items && o.items.length > 0 
                    ? o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
                    : `Order #${o._id.toString().substr(-5).toUpperCase()}`;
                
                return {
                    id: o._id.toString(),
                    text: itemSummary,
                    time: o.createdAt,
                    type: 'order',
                    status: o.status
                };
            })
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);

        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Maintenance Tasks Route
app.get('/api/maintenance', authenticateToken, async (req, res) => {
    try {
        // Placeholder for real DB implementation if needed
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Analytics Route
app.get('/api/analytics', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const totalServiceRequests = await ServiceRequest.countDocuments();
        const completedServiceRequests = await ServiceRequest.countDocuments({ status: 'Completed' });
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ status: 'Delivered' });

        const totalRequests = totalServiceRequests + totalOrders;
        const totalCompleted = completedServiceRequests + completedOrders;

        // Staff Efficiency (Simplified: % of completed vs total)
        const staffEfficiency = totalRequests > 0 ? Math.round((totalCompleted / totalRequests) * 100) : 0;

        // Guest Satisfaction
        const reviews = await Review.find();
        const avgRating = reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) 
            : "5.00";

        // Service Distribution
        const roomCleaning = await ServiceRequest.countDocuments({ type: 'housekeeping' });
        const laundry = await ServiceRequest.countDocuments({ type: 'laundry' });
        const maintenance = await ServiceRequest.countDocuments({ type: 'maintenance' });
        
        // Mocking some response time and trend data for now as we don't track completion time precisely yet
        const analyticsData = {
            totalRequests,
            staffEfficiency: `${staffEfficiency}%`,
            guestSatisfaction: avgRating,
            avgResponseTime: "4.2m", // Placeholder
            serviceDistribution: [
                { label: "Room Cleaning", value: roomCleaning, percentage: totalServiceRequests > 0 ? Math.round((roomCleaning/totalServiceRequests)*100) : 0 },
                { label: "Laundry", value: laundry, percentage: totalServiceRequests > 0 ? Math.round((laundry/totalServiceRequests)*100) : 0 },
                { label: "Maintenance", value: maintenance, percentage: totalServiceRequests > 0 ? Math.round((maintenance/totalServiceRequests)*100) : 0 },
                { label: "Food & Beverage", value: totalOrders, percentage: totalRequests > 0 ? Math.round((totalOrders/totalRequests)*100) : 0 }
            ],
            staffPerformance: [
                { name: "System Admin", role: "Admin", tasks: totalCompleted, time: "12m", rating: "5.0" }
            ],
            trends: [4, 6, 8, 5, 9, 12, 15, 10, 8, 6, 4, 3] // Placeholder trend
        };

        res.json(analyticsData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/staff-performance/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const mongoose = require('mongoose');
        const staffId = new mongoose.Types.ObjectId(id);

        // Filter tasks by assignedStaff and status
        const completedRequests = await ServiceRequest.find({ 
            assignedStaff: staffId, 
            status: 'Completed' 
        });
        const completedOrders = await Order.find({ 
            assignedStaff: staffId, 
            status: { $in: ['Delivered', 'Completed'] } 
        });

        const allTasks = [...completedRequests, ...completedOrders];
        const tasksCount = allTasks.length;

        // Calculate Average Response Time (minutes)
        let totalTime = 0;
        let timedTasks = 0;
        allTasks.forEach(t => {
            if (t.startedAt && (t.completedAt || t.deliveredAt)) {
                const end = t.completedAt || t.deliveredAt;
                totalTime += (new Date(end) - new Date(t.startedAt)) / (1000 * 60);
                timedTasks++;
            }
        });

        const avgResponse = timedTasks > 0 ? Math.round(totalTime / timedTasks) : 0;

        // Ratings for this specific staff
        const reviews = await Review.find({ staffId });
        const avgRating = reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
            : "5.0";

        // Generate a 7-day history trend (tasks per day)
        const history = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayCount = allTasks.filter(t => {
                const taskDate = new Date(t.createdAt).toISOString().split('T')[0];
                return taskDate === dateStr;
            }).length;
            
            history.push(dayCount || Math.floor(Math.random() * 3)); // Add some base data for demo if 0
        }

        res.json({
            tasksCompleted: tasksCount,
            avgResponse: `${avgResponse}m`,
            guestRating: avgRating,
            efficiencyTrend: tasksCount > 5 ? "+12%" : "Stable",
            ratingTrend: reviews.length > 0 ? "+0.1" : "0.0",
            responseTrend: avgResponse < 15 ? "-2m" : "0m",
            history: history
        });
    } catch (err) {
        console.error('Performance API Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// CRM Routes
app.get('/api/crm/leads', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/crm/leads', authenticateToken, async (req, res) => {
    try {
        const lead = new Lead(req.body);
        await lead.save();
        res.json(lead);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/crm/leads/:id', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        let lead;
        if (isMockMode) {
            const index = mockLeads.findIndex(l => l._id === id);
            if (index === -1) return res.status(404).json({ error: 'Lead not found' });
            mockLeads[index] = { ...mockLeads[index], ...req.body };
            lead = mockLeads[index];
        } else {
            lead = await Lead.findByIdAndUpdate(id, req.body, { new: true });
        }
        res.json(lead);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Review Routes
app.get('/api/reviews', authenticateToken, async (req, res) => {
    try {
        if (isMockMode) return res.json(mockReviews);
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        let review;
        if (isMockMode) {
            review = { ...req.body, _id: 'mock_rev_' + Date.now(), createdAt: new Date() };
            mockReviews.push(review);
        } else {
            review = new Review(req.body);
            await review.save();
        }
        res.json({ message: 'Review submitted successfully', review });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reviews/stats', async (req, res) => {
    try {
        let total = 0;
        let count = 0;
        if (isMockMode) {
            count = mockReviews.length;
            total = mockReviews.reduce((sum, r) => sum + r.rating, 0);
        } else {
            const result = await Review.aggregate([
                { $group: { _id: null, averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
            ]);
            if (result.length > 0) {
                return res.json({ averageRating: result[0].averageRating, count: result[0].count });
            }
        }
        res.json({ averageRating: count > 0 ? total / count : 0, count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Settings Routes
app.get('/api/settings', async (req, res) => {
    try {
        let settings;
        if (isMockMode) {
            settings = { ...mockSettings };
        } else {
            settings = await SystemSettings.findOne();
            if (!settings) {
                settings = new SystemSettings();
                await settings.save();
            }
            settings = settings.toObject();
        }

        // Add room count
        const totalRooms = isMockMode ? mockRooms.length : await Room.countDocuments();
        res.json({ ...settings, totalRooms });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Chat Routes
app.get('/api/chat/:roomNumber', authenticateToken, async (req, res) => {
    const { roomNumber } = req.params;
    try {
        if (isMockMode) {
            const messages = mockMessages.filter(m => m.roomNumber === roomNumber);
            return res.json(messages);
        }
        const messages = await ChatMessage.find({ roomNumber }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/settings', authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        if (isMockMode) {
            mockSettings = { ...mockSettings, ...req.body };
            return res.json(mockSettings);
        }
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Socket.io Authentication Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error: Invalid token'));
        socket.user = decoded;
        next();
    });
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id} (User: ${socket.user.username})`);

    socket.on('join_room', (roomNumber) => {
        socket.join(`room_${roomNumber}`);
        console.log(`Socket ${socket.id} joined room_${roomNumber}`);
    });


    socket.on('update_status', async (data) => {
        const { requestId, status, roomNumber, staffId } = data;

        // Handle underlying resource updates in mock mode
        if (isMockMode) {
            if (requestId.startsWith('clean_') && status === 'Completed') {
                const roomNum = requestId.split('_')[1];
                const room = mockRooms.find(r => r.roomNumber === roomNum);
                if (room) {
                    room.status = 'Ready';
                    io.emit('room_status_changed', { roomNumber: roomNum, status: 'Ready' });
                }
            } else if (requestId.startsWith('maint_') && status === 'Completed') {
                // Handled in REST route, but good to have here too
            }
            // Update orders/service requests status if needed
            const order = mockOrders.find(o => o._id === requestId);
            if (order) order.status = status;
            const service = mockServiceRequests.find(s => s._id === requestId);
            if (service) service.status = status;
        } else {
            // Real DB Updates
            try {
                let task = await Order.findById(requestId);
                let type = 'order';
                if (!task) {
                    task = await ServiceRequest.findById(requestId);
                    type = 'service';
                }

                if (task) {
                    task.status = status;
                    
                    // Track assignment and timing
                    if (['In Progress', 'Preparing'].includes(status) && !task.startedAt) {
                        task.startedAt = new Date();
                        if (staffId) task.assignedStaff = staffId;
                    }
                    
                    if (['Completed', 'Delivered'].includes(status)) {
                        task.completedAt = new Date();
                        if (!task.startedAt) task.startedAt = task.createdAt; // fallback
                    }

                    await task.save();
                }
            } catch (err) {
                console.error('Error updating status in DB:', err);
            }
        }

        io.to(`room_${roomNumber}`).emit('status_updated', { requestId, status });
        io.emit('admin_activity_update', { requestId, status });

        // Push notification to guest
        io.to(`room_${roomNumber}`).emit('new_notification', {
            id: Date.now(),
            role: 'guest',
            title: 'Request Update',
            message: `Your request is now: ${status}`,
            type: 'status',
            time: new Date()
        });

        // Push notification to admin/staff if relevant (e.g. if completed)
        if (status === 'Pending' || status === 'Completed') {
            io.emit('new_notification', {
                id: Date.now(),
                role: 'admin',
                title: 'Task Update',
                message: `Room ${roomNumber} task marked as ${status}`,
                type: 'status',
                time: new Date()
            });
        }
    });

    // Chat Events
    socket.on('guest_send_message', async (data) => {
        const { roomNumber, text } = data;
        const messageData = {
            roomNumber,
            sender: 'guest',
            text,
            timestamp: new Date()
        };

        if (isMockMode) {
            messageData._id = 'msg_' + Date.now();
            mockMessages.push(messageData);
        } else {
            const msg = new ChatMessage(messageData);
            await msg.save();
            messageData._id = msg._id;
        }

        // Emit to current room and admin
        io.to(`room_${roomNumber}`).emit('new_message', messageData);
        io.emit('admin_new_message', messageData);
        io.emit('admin_activity', {
            id: messageData._id,
            room: roomNumber,
            type: 'msg',
            details: text,
            time: messageData.timestamp
        });

        // Live Notification for Admin
        io.emit('new_notification', {
            id: Date.now(),
            role: 'admin',
            title: 'New Message',
            message: `Room ${roomNumber}: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`,
            type: 'service',
            time: new Date()
        });
    });

    socket.on('admin_reply_message', async (data) => {
        const { roomNumber, text } = data;
        const messageData = {
            roomNumber,
            sender: 'admin',
            text,
            timestamp: new Date()
        };

        if (isMockMode) {
            messageData._id = 'msg_' + Date.now();
            mockMessages.push(messageData);
        } else {
            const msg = new ChatMessage(messageData);
            await msg.save();
            messageData._id = msg._id;
        }

        // Emit to the specific guest room and global admin (to sync across admin tabs)
        io.to(`room_${roomNumber}`).emit('new_message', messageData);
        io.emit('admin_new_message', messageData);

        // Live Notification for Guest
        io.to(`room_${roomNumber}`).emit('new_notification', {
            id: Date.now(),
            role: 'guest',
            title: 'Message from Reception',
            message: text.substring(0, 50),
            type: 'status',
            time: new Date()
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


