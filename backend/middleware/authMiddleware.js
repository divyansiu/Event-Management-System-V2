const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "campus_event_management_secret_key"
    );
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    req.user = {
      id: String(userId),
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
};

module.exports = authMiddleware;
