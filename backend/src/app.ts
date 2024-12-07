import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import express from 'express';

import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import waterDispensersRoutes from './routes/waterDispensers';
import { InternalServerError } from './utils/errorHandler';

dotenv.config();

const app = express();
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/water_dispensers', waterDispensersRoutes);

// Global error handler

app.use((err: Error, _req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ ...InternalServerError, message: err.message });
});

// Start the server
const PORT = process.env.PORT || 8887;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
