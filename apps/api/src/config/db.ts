import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export const getMongooseConfig = (uri: string): MongooseModuleOptions => {
  return {
    uri,
    connectionFactory: (connection: Connection) => {
      connection.on('connected', () => {
        console.log('✅ Connected to MongoDB');
      });

      connection.on('error', (error) => {
        console.error('❌ MongoDB error:', error);
      });

      connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
      });

      return connection;
    },
  };
};
