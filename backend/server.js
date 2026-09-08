require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

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

