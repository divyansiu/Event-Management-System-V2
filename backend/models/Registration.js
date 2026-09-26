const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },

    status: {
        type: String,
        enum: ["REGISTERED", "CANCELLED"],
        default: "REGISTERED"
    },

    registeredAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Registration", registrationSchema);