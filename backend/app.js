const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const mountIfPresent = (mountPath, relativeFile) => {
  const fullPath = path.join(__dirname, relativeFile);
  if (fs.existsSync(fullPath)) {
    app.use(mountPath, require(fullPath));
  }
};

mountIfPresent("/api/auth", "routes/authRoutes.js");
app.use("/api/events", eventRoutes);
mountIfPresent("/api", "routes/registrationRoutes.js");

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
