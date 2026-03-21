const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
require('dotenv').config();

// Override DNS for MongoDB Atlas resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const StaffSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'Staff', enum: ['Admin', 'Staff'] },
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

const Staff = mongoose.model('Staff', StaffSchema);

const seedStaff = async () => {
    try {
        console.log('Connecting to MongoDB: ' + (process.env.MONGODB_URI ? 'URI found' : 'URI missing'));
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing staff
        await Staff.deleteMany({});

        const admin = new Staff({
            username: process.env.ADMIN_USERNAME || 'admin',
            password: process.env.ADMIN_PASSWORD || 'Password123',
            name: 'Alex Rivera',
            role: 'Admin'
        });

        const staff1 = new Staff({
            username: process.env.STAFF_USERNAME || 'staff1',
            password: process.env.STAFF_PASSWORD || 'Password123',
            name: 'John Doe',
            role: 'Staff'
        });

        // Use .save() to trigger the pre-save hook for hashing
        await admin.save();
        await staff1.save();
        
        console.log('Staff seeded successfully with hashed passwords!');
        process.exit();
    } catch (err) {
        console.error('Error seeding staff:', err);
        process.exit(1);
    }
};

seedStaff();
