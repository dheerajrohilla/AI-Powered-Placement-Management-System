import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      return mongoose.connection;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-db');
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
