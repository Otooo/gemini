import mongoose from 'mongoose';
import { logger } from '../utils/logger';

/**
 * Connection to mongodb
 */
const connectDB = async () => {
  try {
    const databaseName = process.env.DATABASE_NAME || 'shopper_db';

    await mongoose.connect(`mongodb://mongo:27017/${databaseName}`);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('Erro ao conectar ao MongoDB', error);
    process.exit(1);
  }
};

export default connectDB;