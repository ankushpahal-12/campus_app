const reportService = require('../services/report.service');

exports.reportUser = async (req, res) => {
    try {
        const { reportedUserId, reason, details } = req.body;
        const report = await reportService.createReport(req.user.id, reportedUserId, reason, details, req);
        res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMyReports = async (req, res) => {
    try {
        const reports = await reportService.getUserReports(req.user.id);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.reportViolation = async (req, res) => {
    try {
        const { type, details, targetUserId, matchId } = req.body;
        // Generic violation logging logic
        const report = await reportService.createReport(
            req.user.id,
            targetUserId || null,
            `Security Violation: ${type}`,
            details,
            req
        );

        // If it's a screenshot attempt in chat, we could also send a socket alert
        // to the other person (targetUserId)
        if (type === 'SCREENSHOT_ATTEMPT') {
            const notificationService = require('../services/notification.service');

            if (targetUserId) {
                await notificationService.createNotification(
                    targetUserId,
                    'SECURITY_ALERT',
                    'Someone tried to take a screenshot of your content!',
                    { reporterId: req.user.id }
                );
            }

            // Send automated system message to chat if matchId is present
            if (matchId) {
                const chatService = require('../services/chat_service');
                try {
                    await chatService.saveSystemMessage(matchId, '⚠️ SECURITY ALERT: Screenshot attempt detected. This incident has been reported to administrators.');
                } catch (e) {
                    console.error("Error sending auto-message:", e);
                }
            }
        }

        res.status(201).json({ message: 'Violation reported. Our security team has been notified.', report });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReports = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const reports = await reportService.getAllReports(page, limit);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.resolveReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;
        const report = await reportService.resolveReport(reportId, status, req.user.id);
        res.json({ message: 'Report resolved', report });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
