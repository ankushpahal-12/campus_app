const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const { initializeSocket } = require('./src/sockets/socket');
require('dotenv').config();

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
