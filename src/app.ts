import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { IndexRoutes } from './routes/IndexRoutes.js';
import { AuthRoutes } from './app/modules/auth/auth.routes.js';
import { envVars } from './config/envVars.js';
import { notFound } from './app/middleware/notFound.js';
import { globalErrorHandler } from './app/middleware/globalErrorHandler.js';

const app = express();

app.use(cors({
  origin: [envVars.BASE_URL, envVars.FRONTEND_URL],
  credentials: true
}));
app.use(express.json({
  verify: (req: any, res, buf) => {
    if (req.url === "/api/v1/payments/webhook") {
      req.rawBody = buf;
    }
  }
}));
app.use(cookieParser());

// auth module
app.use("/api/auth", AuthRoutes);
// all module routes
app.use('/api/v1', IndexRoutes)

// not found
app.use(notFound);

app.get('/', (req, res) => {
    res.send('Planora API is running!');
});

// global error handler
app.use(globalErrorHandler);

export default app;