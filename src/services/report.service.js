const Report = require('../models/report.model');
const { logAction } = require('./audit.service');

exports.createReport = async (reporterId, reportedUserId, reason, description, req) => {
    const report = await Report.create({
        reporterId: reporterId,
        targetUserId: reportedUserId,
        reason,
        description
    });

    await logAction(reporterId, 'USER_REPORTED', req, { reportedUserId, reportId: report._id });
    return report;
};

exports.getAllReports = async (page = 1, limit = 20) => {
    return await Report.find()
        .populate('reporterId', 'displayName email')
        .populate('targetUserId', 'displayName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

exports.getUserReports = async (userId) => {
    return await Report.find({ reporterId: userId })
        .populate('reporterId', 'displayName email')
        .populate('targetUserId', 'displayName email')
        .sort({ createdAt: -1 });
};

exports.resolveReport = async (reportId, status, adminId) => {
    return await Report.findByIdAndUpdate(
        reportId,
        { status, resolvedBy: adminId },
        { new: true }
    );
};
