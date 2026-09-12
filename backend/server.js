require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL;
const uploadsPath = isVercel ? path.join("/tmp", "uploads") : path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  try {
    fs.mkdirSync(uploadsPath, { recursive: true });
  } catch (e) {}
}
app.use("/uploads", express.static(uploadsPath));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// In production / monolithic mode, serve static frontend assets from Vite build
const frontendDistPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return res.status(404).json({ error: "Endpoint not found" });
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Global error handling middleware (catches Multer validation, file limits, and internal exceptions)
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Attachment exceeds the maximum allowed file size of 5MB." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err.message && (err.message.includes("allowed") || err.message.includes("Only images or PDF"))) {
    return res.status(400).json({ error: err.message });
  }
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Grievance portal API running on http://localhost:${PORT}`);
});

module.exports = app;

