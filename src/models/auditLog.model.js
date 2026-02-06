const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        actorId: mongoose.Schema.Types.ObjectId,
        action: String,
        targetId: mongoose.Schema.Types.ObjectId,
        ipAddress: String,
        metadata: Object
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
