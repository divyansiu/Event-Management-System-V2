const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  status: {
    type: String,
    enum: ["REGISTERED", "CANCELLED"],
    default: "REGISTERED",
  },

  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

registrationSchema.index(
  { studentId: 1, eventId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.Registration ||
  mongoose.model("Registration", registrationSchema);
