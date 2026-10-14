const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth.routes');
const chatRoute = require('./routes/chat.routes');
const path = require('path');

app.use(express.json());
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      origin === "http://localhost:5173" ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// API root and health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Prompt Hub API' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Prompt Hub API' });
});

app.use('/api/auth', authRoute);
app.use('/api/chat', chatRoute);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

module.exports = app;