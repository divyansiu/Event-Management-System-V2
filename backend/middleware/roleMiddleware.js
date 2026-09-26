const authorizeRoles = (...roles) => {
  const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

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
module.exports.roleMiddleware = authorizeRoles;
module.exports.authorizeRoles = authorizeRoles;
module.exports.authorize = authorizeRoles;
