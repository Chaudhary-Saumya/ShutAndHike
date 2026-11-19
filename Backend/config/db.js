const mongoose = require('mongoose');

const dropObsoletePhoneIndex = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) return;

    const indexes = await db.collection('users').indexes();
    const badPhoneIndex = indexes.find(
      (idx) => idx.name === 'phone_1' && (!idx.sparse || idx.unique)
    );

    if (badPhoneIndex) {
      await db.collection('users').dropIndex('phone_1');
      console.log('Successfully dropped legacy unique non-sparse phone_1 index from users collection.');
    }
  } catch (error) {
    // If index doesn't exist or already dropped, safely ignore
  }
};

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shut_and_hike';
    const conn = await mongoose.connect(uri, {
      autoIndex: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop legacy non-sparse phone index to prevent E11000 duplicate key error on null phones
    await dropObsoletePhoneIndex();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // In production, exit if db connection fails; during tests or local setups, allow restart
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
