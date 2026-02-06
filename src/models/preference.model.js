const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true
        },

        minAge: Number,
        maxAge: Number,
        maxDistance: Number,
        interestedIn: {
            type: String,
            enum: ["male", "female", "all"]
        },

        showMe: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Preference", preferenceSchema);
