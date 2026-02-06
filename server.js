require('dotenv').config();
const { createServer } = require('http');
const app = require('./src/app');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const { initializeSocket } = require('./src/sockets/socket');

// 1. Set Trust Proxy (Must be before rate limiter)
app.set('trust proxy', 1);

// 2. Configure Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    validate: { xForwardedForHeader: false } // Prevents that validation crash we saw
});
app.use(limiter);

const port = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();

        // 3. Create the HTTP server instance correctly
        const server = createServer(app);

        // 4. Bind to PORT and 0.0.0.0
        server.listen(port, "0.0.0.0", () => {
            console.log(`🚀 Server confirmed running on port ${port}`);
        });

        // 5. Initialize Socket.io with the correct server instance
        initializeSocket(server);

    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();