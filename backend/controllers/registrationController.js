const Registration = require("../models/Registration");
const Event = require("../models/Event");

// Register for an event
const registerForEvent = async (req, res) => {
    try {
        const studentId = req.user.id;
        const eventId = req.params.id;

        // Check if event exists
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Check if student already has an active registration
        const existingRegistration = await Registration.findOne({
            studentId,
            eventId,
            status: "REGISTERED"
        });

        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: "Already registered for this event"
            });
        }

        // Check event capacity
        const registeredCount = await Registration.countDocuments({
            eventId,
            status: "REGISTERED"
        });

        if (registeredCount >= event.capacity) {
            return res.status(400).json({
                success: false,
                message: "Event is full"
            });
        }

        // Check if the student had cancelled before
        const cancelledRegistration = await Registration.findOne({
            studentId,
            eventId,
            status: "CANCELLED"
        });

        if (cancelledRegistration) {
            cancelledRegistration.status = "REGISTERED";
            cancelledRegistration.registeredAt = new Date();

            await cancelledRegistration.save();

            return res.status(200).json({
                success: true,
                message: "Registration successful",
                data: cancelledRegistration
            });
        }

        // Create new registration
        const registration = await Registration.create({
            studentId,
            eventId,
            status: "REGISTERED"
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: registration
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Cancel registration
const cancelRegistration = async (req, res) => {
    try {
        const studentId = req.user.id;
        const eventId = req.params.id;

        const registration = await Registration.findOne({
            studentId,
            eventId,
            status: "REGISTERED"
        });

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            });
        }

        registration.status = "CANCELLED";

        await registration.save();

        return res.status(200).json({
            success: true,
            message: "Registration cancelled successfully",
            data: registration
        });

    } catch (error) {
        console.error("Cancel registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get current student's registrations
const getMyRegistrations = async (req, res) => {
    try {
        const studentId = req.user.id;

        const registrations = await Registration.find({
            studentId
        }).populate("eventId");

        return res.status(200).json({
            success: true,
            message: "Registrations fetched successfully",
            data: registrations
        });

    } catch (error) {
        console.error("Get registrations error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    registerForEvent,
    cancelRegistration,
    getMyRegistrations
};