import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const databaseUri = process.env.DATABASE_URI!;

mongoose.connect(databaseUri, {
  autoIndex: true,
});

const database = mongoose.connection;

export const db = database;

export default {};
