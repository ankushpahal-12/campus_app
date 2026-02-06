const presenceService = require('../services/presence.service');
const { getIO } = require('../sockets/socket');

exports.updatePresence = async (req, res) => {
    try {
        // Ping-style update to maintain 'online' status in Redis
        const socketId = req.body.socketId || 'http-ping';
        await presenceService.setUserOnline(req.user.id, socketId);

        const io = getIO();
        io.emit('presence_update', { userId: req.user.id, status: 'online' });

        res.status(200).send('OK');
    } catch (error) {
        res.status(500).json({ message: 'Error updating presence' });
    }
};

exports.getPresence = async (req, res) => {
    try {
        const isOnline = await presenceService.isUserOnline(req.params.userId);
        res.json({ isOnline });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
