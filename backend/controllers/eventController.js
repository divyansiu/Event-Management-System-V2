const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

const isValidObjectId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

const isOwner = (event, userId) => String(event.organizerId) === String(userId);

const requiredFields = [
  "title",
  "description",
  "category",
  "date",
  "time",
  "location",
  "capacity",
];

const validateEventPayload = (body, { partial = false } = {}) => {
  const payload = {};

  const fields = partial
    ? requiredFields.filter((field) => Object.prototype.hasOwnProperty.call(body, field))
    : requiredFields;

  if (!partial) {
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return {
          error: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
        };
      }
    }
  }

  for (const field of fields) {
    const value = body[field];

    if (value === undefined || value === null || value === "") {
      return {
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
      };
    }

    if (field === "capacity") {
      const capacity = Number(value);
      if (!Number.isInteger(capacity) || capacity < 1) {
        return { error: "Capacity must be a positive integer" };
      }
      payload.capacity = capacity;
      continue;
    }

    if (field === "date") {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return { error: "Date is invalid" };
      }
      payload.date = date;
      continue;
    }

    if (typeof value !== "string" || !value.trim()) {
      return {
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
      };
    }

    payload[field] = value.trim();
  }

  return { payload };
};

const formatEvent = (event) => ({
  _id: event._id,
  title: event.title,
  description: event.description,
  category: event.category,
  date: event.date,
  time: event.time,
  location: event.location,
  capacity: event.capacity,
  organizerId: event.organizerId,
  createdAt: event.createdAt,
});

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events.map(formatEvent),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: formatEvent(event),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { error, payload } = validateEventPayload(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const event = await Event.create({
      ...payload,
      organizerId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: formatEvent(event),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!isOwner(event, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const { error, payload } = validateEventPayload(req.body, { partial: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    Object.assign(event, payload);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: formatEvent(event),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!isOwner(event, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Registration.deleteMany({ eventId: event._id });
    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!isOwner(event, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const registrations = await Registration.find({
      eventId: event._id,
      status: "REGISTERED",
    }).populate("studentId", "name email role");

    const participants = registrations.map((registration) => ({
      registrationId: registration._id,
      studentId: registration.studentId,
      status: registration.status,
      registeredAt: registration.registeredAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Participants fetched successfully",
      data: participants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
