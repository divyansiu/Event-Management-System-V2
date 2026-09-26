const express = require("express");
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", eventController.getEvents);
router.get("/:id/participants", authMiddleware, authorizeRoles("organizer"), eventController.getEventParticipants);
router.get("/:id", eventController.getEventById);
router.post("/", authMiddleware, authorizeRoles("organizer"), eventController.createEvent);
router.put("/:id", authMiddleware, authorizeRoles("organizer"), eventController.updateEvent);
router.delete("/:id", authMiddleware, authorizeRoles("organizer"), eventController.deleteEvent);

module.exports = router;
