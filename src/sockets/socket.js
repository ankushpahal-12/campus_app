const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/user.model');
const chatSocket = require('./chat.socket');
const presenceSocket = require('./presence.socket');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow all for dev, restrict in prod
            methods: ["GET", "POST"]
        }
    });

    // Authentication Middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

            if (!token) {
                return next(new Error('Authentication error: No token'));
            }

            // Remove Bearer if present
            const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

            const { verifyToken } = require('../utils/jwt.util');
            const decoded = verifyToken(tokenString);
            const user = await User.findById(decoded.id).select('-passwordHash');

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User Connected: ${socket.user.displayName} (${socket.id})`);

        // Join a room named after the user ID for private notifications
        socket.join(socket.user.id.toString());

        // Initialize socket modules
        chatSocket(io, socket);
        presenceSocket(io, socket);

        socket.on('disconnect', () => {
            console.log('User Disconnected:', socket.user.displayName);
            // Handle offline status here if not handled in presence socket
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initializeSocket, getIo };
