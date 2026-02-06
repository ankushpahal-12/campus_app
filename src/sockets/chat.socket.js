const chatService = require('../services/chat.service');

module.exports = (io, socket) => {
    const userId = socket.user.id.toString();

    // Join Match-Specific Chat Room
    socket.on('join_match_chat', async ({ matchId }) => {
        socket.join(matchId);
        console.log(`User ${socket.user.displayName} joined match room: ${matchId}`);
    });

    // Send Message with Persistence
    socket.on('send_message', async ({ matchId, content, type }) => {
        try {
            const message = await chatService.sendMessage(matchId, userId, content, type);
            io.to(matchId).emit('new_message', { matchId, message });
        } catch (error) {
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Typing Indicators
    socket.on('typing', ({ matchId }) => {
        socket.to(matchId).emit('user_typing', { userId, matchId });
    });

    socket.on('stop_typing', ({ matchId }) => {
        socket.to(matchId).emit('user_stop_typing', { userId, matchId });
    });

    // Read Receipts
    socket.on('mark_read', async ({ matchId }) => {
        await chatService.markAsRead(matchId, userId);
        socket.to(matchId).emit('messages_read', { userId, matchId });
    });
};
