import path from 'path';
import dotenv from 'dotenv';

// Load env from root .env.local - BEFORE any other imports
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

import express from 'express';
import cors from 'cors';

import { sendPassRouter } from './routes/send-pass';
import { submitPassRouter } from './routes/submit-pass';
import { verifyPaymentRouter } from './routes/verify-payment';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/send-pass', sendPassRouter);
app.use('/api/submit-pass', submitPassRouter);
app.use('/api/verify-payment', verifyPaymentRouter);

app.listen(PORT, () => {
  console.log(`🚀 EPass backend running on http://localhost:${PORT}`);
});

export default app;
