const mongoose = require('mongoose');
require('dotenv').config();

const RoomSchema = new mongoose.Schema({
    roomNumber: { type: String, unique: true, required: true },
    type: { type: String, required: true },
    status: { type: String, default: 'Ready', enum: ['Ready', 'Occupied', 'Cleaning', 'Maintenance'] },
    currentGuest: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    floor: { type: Number, required: true },
    lastCleaned: { type: String, default: 'Just now' }
});

const Room = mongoose.model('Room', RoomSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/roomflow';

async function seedRooms() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await Room.deleteMany({});
        console.log('Cleared existing rooms');

        const rooms = [];
        for (let i = 100; i <= 300; i++) {
            const floor = Math.floor(i / 100);
            let type = 'Deluxe Room';
            if (i % 25 === 0) type = 'Presidential Suite';
            else if (i % 10 === 0) type = 'Executive Suite';
            else if (i % 3 === 0) type = 'Junior Suite';

            rooms.push({
                roomNumber: i.toString(),
                type: type,
                status: 'Ready',
                floor: floor,
                lastCleaned: `${Math.floor(Math.random() * 12 + 1)}h ago`
            });
        }

        await Room.insertMany(rooms);
        console.log(`Successfully seeded ${rooms.length} rooms (100-300)`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding rooms:', err);
        process.exit(1);
    }
}

seedRooms();
