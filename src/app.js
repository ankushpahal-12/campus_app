const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const accountRoutes = require('./routes/account.routes');
const deviceRoutes = require('./routes/device.routes');
const presenceRoutes = require('./routes/presence.route');
const notificationRoutes = require('./routes/notification.routes');
const matchRoutes = require('./routes/match.routes');
const chatRoutes = require('./routes/chat.routes');
const adminRoutes = require('./routes/admin.routes');
const reportRoutes = require('./routes/report.routes');
const blockRoutes = require('./routes/block.routes');
const visibilityRoutes = require('./routes/visibility.routes');
const preferencesRoutes = require('./routes/preferences.routes');
const userRoutes = require('./routes/user.routes');
const contentRoutes = require('./routes/content.routes');
const uploadRoutes = require('./routes/upload.routes');
const { checkDeviceStatus } = require('./middlewares/device.middleware');
const { autoModerate } = require('./middlewares/moderation.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Security HTTP headers
app.use(helmet());

const { apiLimiter } = require('./middlewares/rateLimit.middleware');
app.use('/api', apiLimiter);

// Auto-moderate profiles and messages
app.use(['/api/profile', '/api/chats'], autoModerate(['content', 'bio']));

// Check if device is still authorized
app.use('/api', checkDeviceStatus);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// CORS
app.use(cors());



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/block', blockRoutes);
app.use('/api/visibility', visibilityRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);

// Global Error Handling Middleware
app.use(errorMiddleware);
app.get('/', (req, res) => {
    res.send('<h1>The API is running!</h1><p>The backend is officially live on Railway.</p>');
});
module.exports = app;