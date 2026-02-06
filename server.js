require('dotenv').config();
const app = require('./src/app');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');

const port = process.env.PORT || 5000;
app.set('trust proxy', 1);
const startServer = async () => {
    await connectDB();
    await connectRedis();

    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    initializeSocket(server);
};
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);
startServer();
