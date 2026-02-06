const presenceService = require('../services/presence.service');

module.exports = (io, socket) => {
    const userId = socket.user.id.toString();

    // 1. Mark Online & Broadcast to Matches
    presenceService.setUserOnline(userId, socket.id).then(async () => {
        const matches = await presenceService.getMatchesForBroadcast(userId);
        matches.forEach(matchId => {
            io.to(matchId.toString()).emit('user_online', { userId });
        });
    });

    // 2. Handle Disconnect
    socket.on('disconnect', async () => {
        const isFullyOffline = await presenceService.setUserOffline(userId, socket.id);

        if (isFullyOffline) {
            const matches = await presenceService.getMatchesForBroadcast(userId);
            matches.forEach(matchId => {
                io.to(matchId.toString()).emit('user_offline', {
                    userId,
                    lastSeen: Date.now()
                });
            });
        }
    });

    socket.on('update_status', async (status) => {
        // status: 'online', 'busy', 'offline'
        await presenceService.setStatus(userId, status);

        const matches = await presenceService.getMatchesForBroadcast(userId);
        matches.forEach(matchId => {
            io.to(matchId.toString()).emit('user_status_changed', {
                userId,
                status
            });
        });
    });
};
