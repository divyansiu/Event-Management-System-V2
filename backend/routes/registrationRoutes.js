const express = require("express");

const {
    registerForEvent,
    cancelRegistration,
    getMyRegistrations
} = require("../controllers/registrationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Register for an event
router.post(
    "/events/:id/register",
    authMiddleware,
    registerForEvent
);


// Cancel registration
router.delete(
    "/events/:id/register",
    authMiddleware,
    cancelRegistration
);


// Get current student's registrations
router.get(
    "/registrations/me",
    authMiddleware,
    getMyRegistrations
);


module.exports = router;