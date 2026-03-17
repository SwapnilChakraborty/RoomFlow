const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function clearActivity() {
    let client;
    try {
        if (!MONGODB_URI) {
            console.error('Error: MONGODB_URI is not set in .env');
            process.exit(1);
        }

        console.log('Connecting to MongoDB via MongoClient...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected successfully.');

        const db = client.db(); // Uses the DB from the connection string
        const collections = ['orders', 'servicerequests'];
        
        for (const colName of collections) {
            try {
                const result = await db.collection(colName).deleteMany({});
                console.log(`Cleared ${result.deletedCount} documents from collection: ${colName}`);
            } catch (err) {
                console.error(`Error clearing ${colName}:`, err.message);
            }
        }

        console.log('Activity data cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err.message);
        process.exit(1);
    } finally {
        if (client) await client.close();
    }
}

clearActivity();
