const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/roomflow';

let isMockMode = false;
mongoose.set('bufferCommands', false); // Fail fast, don't buffer if disconnected

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        console.warn('Proceeding in Mock Mode (Local Data Only)');
        isMockMode = true;
        initializeMockData();
    });

// Schemas
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
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    checkIn: { type: Date, default: Date.now },
    checkOut: { type: Date }
});

const Customer = mongoose.model('Customer', CustomerSchema);

const StaffSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'Staff', enum: ['Admin', 'Staff'] },
    createdAt: { type: Date, default: Date.now }
});

const Staff = mongoose.model('Staff', StaffSchema);

const OrderSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    items: [{
        name: String,
        price: Number,
        quantity: Number
    }],
    total: Number,
    status: { type: String, default: 'Pending', enum: ['Pending', 'Preparing', 'Delivered', 'Cancelled'] },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);

const ServiceRequestSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    type: { type: String, required: true }, // 'housekeeping', 'laundry', 'maintenance'
    details: String,
    status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Completed'] },
    priority: { type: String, default: 'normal', enum: ['low', 'normal', 'high', 'urgent'] },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
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

const SystemSettingsSchema = new mongoose.Schema({
    crmEnabled: { type: Boolean, default: true },
    hotelName: { type: String, default: 'RoomFlow Premium' },
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 12 }
});

const SystemSettings = mongoose.model('SystemSettings', SystemSettingsSchema);

// Mock Data Storage
let mockRooms = [];
let mockCustomers = [];
let mockOrders = [];
let mockServiceRequests = [];
let mockMaintenanceTasks = []; // Track active maintenance issues
let mockStaff = [
    { _id: 'mock_staff_admin', username: 'admin', password: 'password123', name: 'Alex Rivera', role: 'Admin' },
    { _id: 'mock_staff_1', username: 'staff1', password: 'password123', name: 'John Doe', role: 'Staff' }
];
let mockLeads = [];
let mockSettings = {
    crmEnabled: true,
    hotelName: 'RoomFlow Premium',
    currency: 'USD',
    taxRate: 12
};

function initializeMockData() {
    mockRooms = Array.from({ length: 20 }, (_, i) => ({
        _id: `mock_room_${101 + i}`,
        roomNumber: (101 + i).toString(),
        type: i % 5 === 0 ? 'Presidential Suite' : i % 3 === 0 ? 'Junior Suite' : 'Deluxe Room',
        status: i === 2 ? 'Occupied' : i === 5 ? 'Cleaning' : 'Ready',
        floor: Math.floor((101 + i) / 100),
        lastCleaned: '2h ago',
        currentGuest: i === 2 ? { _id: 'mock_cust_1', name: 'John Anderson' } : null
    }));

    if (mockRooms[2].status === 'Occupied') {
        const guest = {
            _id: 'mock_cust_1',
            customerID: 'CUST8842',
            name: 'John Anderson',
            room: mockRooms[2]._id, // Store ID only to avoid circular reference
            checkIn: new Date(Date.now() - 86400000), // Yesterday
            checkOut: new Date(Date.now() + 86400000 * 3) // 3 days from now
        };
        mockCustomers.push(guest);
        mockRooms[2].currentGuest = guest;
    }

    // Initialize some mock leads
    mockLeads = [
        { _id: 'lead_1', name: 'Corporate Event - TechCorp', email: 'events@techcorp.com', status: 'Qualified', value: 5000, source: 'LinkedIn', createdAt: new Date(Date.now() - 86400000 * 2) },
        { _id: 'lead_2', name: 'Wedding Inquiry - Sarah J.', email: 'sarah.j@example.com', status: 'New', value: 12000, source: 'Referral', createdAt: new Date(Date.now() - 86400000) },
        { _id: 'lead_3', name: 'Group Booking - Explorers Club', email: 'info@explorers.org', status: 'Contacted', value: 3500, source: 'Website', createdAt: new Date() }
    ];
}

// Helper to broadcast stats
async function broadcastStats() {
    let stats;
    if (isMockMode) {
        const totalRooms = mockRooms.length;
        const occupiedRooms = mockRooms.filter(r => r.status === 'Occupied').length;
        stats = {
            totalRooms,
            occupiedRooms,
            cleaningRooms: mockRooms.filter(r => r.status === 'Cleaning').length,
            maintenanceRooms: mockRooms.filter(r => r.status === 'Maintenance').length,
            totalGuests: mockCustomers.length,
            occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0
        };
    } else {
        const totalRooms = await Room.countDocuments();
        const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
        stats = {
            totalRooms,
            occupiedRooms,
            cleaningRooms: await Room.countDocuments({ status: 'Cleaning' }),
            maintenanceRooms: await Room.countDocuments({ status: 'Maintenance' }),
            totalGuests: await Customer.countDocuments(),
            occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0
        };
    }
    io.emit('stats_update', stats);
}

// Order Routes
app.post('/api/orders', async (req, res) => {
    try {
        let order;
        if (isMockMode) {
            order = { ...req.body, _id: 'mock_order_' + Date.now(), createdAt: new Date(), status: 'Pending' };
            mockOrders.push(order);
        } else {
            order = new Order(req.body);
            await order.save();
        }

        io.emit('admin_activity', {
            id: order._id.toString(),
            room: order.roomNumber,
            type: 'order',
            details: order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
            total: order.total,
            status: order.status,
            time: order.createdAt
        });

        res.json({ message: 'Order placed successfully', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Service Request Routes
app.post('/api/service-requests', async (req, res) => {
    try {
        let request;
        if (isMockMode) {
            request = { ...req.body, _id: 'mock_srv_' + Date.now(), createdAt: new Date() };
            mockServiceRequests.push(request);
        } else {
            request = new ServiceRequest(req.body);
            await request.save();
        }

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

        res.json({ message: 'Request submitted successfully', request });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes
app.get('/api/health', (req, res) => {
    const dbStatus = isMockMode ? 'mock' : (mongoose.connection.readyState === 1 ? 'connected' : 'disconnected');
    res.json({
        status: 'ok',
        service: 'RoomFlow API',
        database: dbStatus,
        connectionState: mongoose.connection.readyState,
        mockMode: isMockMode
    });
});

// Room Routes
app.get('/api/rooms', async (req, res) => {
    try {
        if (isMockMode) {
            return res.json(mockRooms);
        }
        const rooms = await Room.find().populate('currentGuest');
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Allot Room Route
app.post('/api/allot-room', async (req, res) => {
    const { roomNumber, guestName, checkIn, checkOut } = req.body;
    try {
        let room, customerID, customer;

        if (isMockMode) {
            room = mockRooms.find(r => r.roomNumber === roomNumber);
            if (!room) return res.status(404).json({ error: 'Room not found' });
            if (room.status !== 'Ready') return res.status(400).json({ error: 'Room is not ready' });

            customerID = 'CUST' + Math.floor(1000 + Math.random() * 9000);
            customer = { _id: 'mock_cust_' + Date.now(), customerID, name: guestName, room: { ...room }, checkIn, checkOut };
            mockCustomers.push({ ...customer, room: room._id }); // Store ID in array to prevent circularity if saved

            room.status = 'Occupied';
            room.currentGuest = { ...customer, room: undefined }; // Point to customer, but avoid loop
        } else {
            room = await Room.findOne({ roomNumber });
            if (!room) return res.status(404).json({ error: 'Room not found' });
            if (room.status !== 'Ready') return res.status(400).json({ error: 'Room is not ready' });

            customerID = 'CUST' + Math.floor(1000 + Math.random() * 9000);
            customer = new Customer({ customerID, name: guestName, room: room._id, checkIn, checkOut });
            await customer.save();

            room.status = 'Occupied';
            room.currentGuest = customer._id;
            await room.save();
        }

        io.emit('room_status_changed', { roomNumber, status: 'Occupied' });
        broadcastStats();

        res.json({ message: 'Room allotted successfully', customerID, customer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check-out Route
app.post('/api/checkout', async (req, res) => {
    const { roomNumber } = req.body;
    try {
        let room;
        if (isMockMode) {
            room = mockRooms.find(r => r.roomNumber === roomNumber);
            if (!room) return res.status(404).json({ error: 'Room not found' });

            if (room.currentGuest) {
                mockCustomers = mockCustomers.filter(c => c._id !== room.currentGuest._id);
            }
            room.status = 'Cleaning';
            room.currentGuest = null;
        } else {
            room = await Room.findOne({ roomNumber }).populate('currentGuest');
            if (!room) return res.status(404).json({ error: 'Room not found' });
            if (room.currentGuest) {
                await Customer.findByIdAndDelete(room.currentGuest._id);
            }
            room.status = 'Cleaning';
            room.currentGuest = null;
            await room.save();
        }

        io.emit('room_status_changed', { roomNumber, status: 'Cleaning' });
        io.emit('guest_checkout', { roomNumber });
        io.emit('admin_activity', {
            id: `clean_${roomNumber}`,
            room: roomNumber,
            type: 'housekeeping',
            details: 'Housekeeping Required',
            time: new Date(),
            status: 'Pending',
            priority: 'High'
        });
        broadcastStats();

        res.json({ message: 'Checked out successfully.', room });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Room Status Route
app.post('/api/update-room-status', async (req, res) => {
    const { roomNumber, status } = req.body;
    try {
        let room;
        if (isMockMode) {
            room = mockRooms.find(r => r.roomNumber === roomNumber);
            if (!room) return res.status(404).json({ error: 'Room not found' });
            room.status = status;
            if (status === 'Ready') {
                room.currentGuest = null;
                // If it was in maintenance, mark task as completed
                const task = mockMaintenanceTasks.find(t => t.roomNumber === roomNumber && t.status !== 'Completed');
                if (task) task.status = 'Completed';
            }

            // If going INTO maintenance, create a task if one doesn't exist
            if (status === 'Maintenance') {
                const existing = mockMaintenanceTasks.find(t => t.roomNumber === roomNumber && t.status !== 'Completed');
                if (!existing) {
                    mockMaintenanceTasks.push({
                        id: 'maint_' + Date.now(),
                        roomNumber,
                        issue: req.body.issue || 'General Maintenance',
                        priority: req.body.priority || 'Medium',
                        status: 'Active',
                        createdAt: new Date()
                    });
                }
            }
        } else {
            room = await Room.findOne({ roomNumber });
            if (!room) return res.status(404).json({ error: 'Room not found' });
            room.status = status;
            if (status === 'Ready') room.currentGuest = null;
            await room.save();
        }

        io.emit('room_status_changed', { roomNumber, status });
        if (status === 'Cleaning') {
            io.emit('admin_activity', {
                id: `clean_${roomNumber}`,
                room: roomNumber,
                type: 'housekeeping',
                details: 'Housekeeping Required',
                time: new Date(),
                status: 'Pending',
                priority: 'High'
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
        let customer;
        if (isMockMode) {
            customer = mockCustomers.find(c => c.customerID === customerID);
            if (customer && typeof customer.room === 'string') {
                // Populate room object from ID
                const room = mockRooms.find(r => r._id === customer.room || r.roomNumber === customer.room);
                customer = { ...customer, room };
            }
        } else {
            customer = await Customer.findOne({ customerID }).populate('room');
        }
        if (!customer) return res.status(404).json({ error: 'Invalid Customer ID' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stats Route
app.get('/api/stats', async (req, res) => {
    try {
        if (isMockMode) {
            const totalRooms = mockRooms.length;
            const occupiedRooms = mockRooms.filter(r => r.status === 'Occupied').length;
            return res.json({
                totalRooms,
                occupiedRooms,
                cleaningRooms: mockRooms.filter(r => r.status === 'Cleaning').length,
                maintenanceRooms: mockRooms.filter(r => r.status === 'Maintenance').length,
                totalGuests: mockCustomers.length,
                occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0
            });
        }
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
        let staff;
        if (isMockMode) {
            staff = mockStaff.find(s => s.username === username && s.password === password);
        } else {
            staff = await Staff.findOne({ username, password });
        }
        if (!staff) return res.status(401).json({ error: 'Invalid credentials' });

        res.json({
            id: staff._id,
            username: staff.username,
            name: staff.name,
            role: staff.role
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Activity Feed Route
app.get('/api/activity', async (req, res) => {
    try {
        let serviceRequests, orders, cleaningRooms = [];
        if (isMockMode) {
            serviceRequests = [...mockServiceRequests].reverse().slice(0, 10);
            orders = [...mockOrders].reverse().slice(0, 10);
            cleaningRooms = mockRooms.filter(r => r.status === 'Cleaning');
        } else {
            serviceRequests = await ServiceRequest.find().sort({ createdAt: -1 }).limit(10).lean();
            orders = await Order.find().sort({ createdAt: -1 }).limit(10).lean();
            cleaningRooms = await Room.find({ status: 'Cleaning' }).lean();
        }

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
            ...cleaningRooms.map(r => ({
                id: `housekeeping_${r.roomNumber}`,
                room: r.roomNumber,
                details: 'Regular Cleaning Required',
                time: r.lastCleanedAt || new Date(new Date().setHours(8, 0, 0, 0)), 
                type: 'housekeeping',
                status: 'Pending',
                priority: 'Normal'
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);

        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Guest Activity Route
app.get('/api/guest-activity/:roomNumber', async (req, res) => {
    const { roomNumber } = req.params;
    try {
        let serviceRequests, orders;
        if (isMockMode) {
            serviceRequests = mockServiceRequests.filter(r => r.roomNumber === roomNumber);
            orders = mockOrders.filter(o => o.roomNumber === roomNumber);
        } else {
            serviceRequests = await ServiceRequest.find({ roomNumber }).lean();
            orders = await Order.find({ roomNumber }).lean();
        }

        const activities = [
            ...serviceRequests.map(r => ({
                id: r._id.toString(),
                text: `${r.type.charAt(0).toUpperCase() + r.type.slice(1)} Request`,
                time: r.createdAt,
                type: 'service',
                status: r.status
            })),
            ...orders.map(o => ({
                id: o._id.toString(),
                text: `Order #${o._id.toString().substr(-5)}`,
                time: o.createdAt,
                type: 'order',
                status: o.status
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Maintenance Tasks Route
app.get('/api/maintenance', async (req, res) => {
    try {
        if (isMockMode) {
            res.json(mockMaintenanceTasks);
        } else {
            // Placeholder for real DB implementation if needed
            res.json([]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CRM Routes
app.get('/api/crm/leads', async (req, res) => {
    try {
        if (isMockMode) return res.json(mockLeads);
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/crm/leads', async (req, res) => {
    try {
        let lead;
        if (isMockMode) {
            lead = { ...req.body, _id: 'lead_' + Date.now(), createdAt: new Date() };
            mockLeads.push(lead);
        } else {
            lead = new Lead(req.body);
            await lead.save();
        }
        res.json(lead);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/crm/leads/:id', async (req, res) => {
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

// Settings Routes
app.get('/api/settings', async (req, res) => {
    try {
        if (isMockMode) return res.json(mockSettings);
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings();
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/settings', async (req, res) => {
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

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (roomNumber) => {
        socket.join(`room_${roomNumber}`);
        console.log(`Socket ${socket.id} joined room_${roomNumber}`);
    });


    socket.on('update_status', async (data) => {
        const { requestId, status, roomNumber } = data;

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
                const order = await Order.findById(requestId);
                if (order) {
                    order.status = status;
                    await order.save();
                } else {
                    const service = await ServiceRequest.findById(requestId);
                    if (service) {
                        service.status = status;
                        await service.save();
                    }
                }
            } catch (err) {
                console.error('Error updating status in DB:', err);
            }
        }

        io.to(`room_${roomNumber}`).emit('status_updated', { requestId, status });
        io.emit('admin_activity_update', { requestId, status });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


