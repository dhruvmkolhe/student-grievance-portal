const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department, staffSecret } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const ALLOWED_ROLES = ["student", "hod", "proctor", "warden", "repairman", "admin"];
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${ALLOWED_ROLES.join(", ")}` });
    }

    // Prevent privilege escalation: only students can self-register without the authorized staff secret
    if (role !== "student") {
      const expectedSecret = process.env.STAFF_REGISTRATION_SECRET || "REDRESSAL_STAFF_SECRET_2025";
      if (!staffSecret || staffSecret !== expectedSecret) {
        return res.status(403).json({
          error: "Valid staff passcode is required to register as staff or administrator.",
        });
      }
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    db.prepare(
      "INSERT INTO users (id, name, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, name, email, hashed, role, department || null);

    const token = jwt.sign({ id, name, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id, name, email, role, department } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// List staff members for assignment and contact (requires authenticated user)
router.get("/staff", authenticate, (req, res) => {
  try {
    const staff = db
      .prepare(
        "SELECT id, name, email, role, department FROM users WHERE role != 'student' ORDER BY role ASC, name ASC"
      )
      .all();
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch staff list" });
  }
});

module.exports = router;
