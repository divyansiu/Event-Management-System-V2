const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
/**
 * Middleware to restrict access based on user roles
 * Usage examples:
 *   router.post('/events', authMiddleware, roleMiddleware('organizer'), createEvent);
 *   router.get('/events', authMiddleware, roleMiddleware('student', 'organizer'), getEvents);
 *   router.get('/events', authMiddleware, roleMiddleware(['student', 'organizer']), getEvents);
 */
const roleMiddleware = (...roles) => {
    // Support passing roles either as separate arguments or as an array
    const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

    return (req, res, next) => {
        // Ensure user is authenticated first
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // Check if user role matches allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden: Insufficient permissions'
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
module.exports.roleMiddleware = roleMiddleware;
module.exports.authorizeRoles = roleMiddleware;
module.exports.authorize = roleMiddleware;
