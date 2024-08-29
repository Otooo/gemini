import express, { Request, Response } from 'express';
import { json, urlencoded } from 'express';
import connectDB from './configs/database';
import measureRoutes from './routes/measure-route';
import { logger } from './utils/logger';

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(json({ limit: '10mb' }));
app.use(urlencoded({ limit: '10mb', extended: true }));

// Connect to database
connectDB();

// Middleware for JSON parser
app.use(express.json());

// Checking route server
app.get('/check', (request: Request, res: Response) => {
  res.send('Server working!!!');
});

// Routes (we can use /api)
app.use('/', measureRoutes);

// Start server
app.listen(port, () => {
  logger.info(`Server running on localhost:${port}`);
});
