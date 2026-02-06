require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const { initializeSocket } = require('./src/sockets/socket');

const port = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    await connectRedis();

    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    initializeSocket(server);
};

startServer();
