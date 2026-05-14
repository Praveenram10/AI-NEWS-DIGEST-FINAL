require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');
const { exec } = require('child_process');

// Import routes
const subscriberRoutes = require('./routes/subscribers');
const adminRoutes = require('./routes/admin');
const newsRoutes = require('./routes/news');

// Import services
const { startDailyNewsTask } = require('./services/newsService');
const { startDailyEmailTask } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database on startup
console.log('🔄 Initializing database...');
require('./database/init.js');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/admin-assets', express.static(path.join(__dirname, '../admin')));

// Routes
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Newsletter Server running on http://localhost:${PORT}`);
  console.log(`📨 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`📋 Subscriber Portal: http://localhost:${PORT}`);
});

// Initialize scheduled tasks
console.log('⏰ Initializing scheduled tasks...');
// News fetching - 3 AM daily
startDailyNewsTask();
// Email sending - 6 AM daily
startDailyEmailTask();

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
