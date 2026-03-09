const mongoose = require('mongoose');
require('dotenv').config();

const StaffSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'Staff', enum: ['Admin', 'Staff'] },
    createdAt: { type: Date, default: Date.now }
});

const Staff = mongoose.model('Staff', StaffSchema);

const seedStaff = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roomflow');
        console.log('Connected to MongoDB');

        // Clear existing staff
        await Staff.deleteMany({});

        const admin = new Staff({
            username: 'admin',
            password: 'password123', // In production, use bcrypt
            name: 'Alex Rivera',
            role: 'Admin'
        });

        const staff1 = new Staff({
            username: 'staff1',
            password: 'password123',
            name: 'John Doe',
            role: 'Staff'
        });

        await Staff.insertMany([admin, staff1]);
        console.log('Staff seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding staff:', err);
        process.exit(1);
    }
};

seedStaff();
