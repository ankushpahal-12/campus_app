const chatService = require('../services/chat.service');

exports.getMessages = async (req, res) => {
    try {
        const { matchId } = req.params;
        const chat = await chatService.getChatByMatch(matchId, req.user.id, req.user.email);

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        const messages = await chatService.getMessages(
            chat._id,
            req.user.id,
            req.user.email,
            req.query.limit || 50,
            req.query.skip || 0
        );

        res.json(messages);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { matchId } = req.params;
        await chatService.markAsRead(matchId, req.user.id);
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
