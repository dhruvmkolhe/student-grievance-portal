const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { authenticate, requireRole, requireStaff, STAFF_ROLES } = require("../middleware/auth");

const router = express.Router();

const ROLE_PURVIEWS = {
  hod: ["Academic & Curriculum", "Faculty & Teaching", "Exam & Results", "Academic"],
  proctor: ["Discipline & Safety", "Faculty behaviour", "Other"],
  repairman: ["Campus Facilities & Maintenance", "Campus facilities"],
  warden: ["Hostel & Mess", "Hostel"],
  admin: null, // Full access
};

const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL;
const uploadDir = isVercel ? path.join("/tmp", "uploads") : path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {}
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Only images or PDF files are allowed"), ok);
  },
});

// Student: submit a new complaint
router.post(
  "/",
  authenticate,
  requireRole("student"),
  upload.single("attachment"),
  (req, res) => {
    try {
      const { title, category, description, department } = req.body;
      if (!title || !category || !description) {
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {}
        }
        return res.status(400).json({ error: "Missing required fields" });
      }
      const id = uuidv4();
      const attachmentPath = req.file ? `/uploads/${req.file.filename}` : null;
      db.prepare(
        `INSERT INTO complaints (id, student_id, title, category, description, department, attachment_path)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(id, req.user.id, title, category, description, department || null, attachmentPath);

      const created = db.prepare("SELECT * FROM complaints WHERE id = ?").get(id);
      res.status(201).json(created);
    } catch (err) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {}
      }
      console.error(err);
      res.status(500).json({ error: "Could not submit complaint" });
    }
  }
);

// Student: view own complaints. Staff (HOD, Proctor, Warden, Repairman, Admin): view complaints with filters
router.get("/", authenticate, (req, res) => {
  try {
    const { status, category, purview, assigned_to } = req.query;
    let rows;
    if (req.user.role === "student") {
      rows = db
        .prepare("SELECT * FROM complaints WHERE student_id = ? ORDER BY created_at DESC")
        .all(req.user.id);
    } else {
      let query = `
        SELECT complaints.*, users.name AS student_name, users.email AS student_email, users.department AS student_dept
        FROM complaints JOIN users ON complaints.student_id = users.id
        WHERE 1=1
      `;
      const params = [];
      if (status) {
        query += " AND complaints.status = ?";
        params.push(status);
      }
      if (assigned_to) {
        if (assigned_to === "me") {
          query += " AND complaints.assigned_to = ?";
          params.push(req.user.id);
        } else if (assigned_to === "unassigned") {
          query += " AND complaints.assigned_to IS NULL";
        } else {
          query += " AND complaints.assigned_to = ?";
          params.push(assigned_to);
        }
      }

      // Enforce category purview: non-admin staff are strictly restricted to their department purview
      if (req.user.role !== "admin" && ROLE_PURVIEWS[req.user.role]) {
        const allowedCats = ROLE_PURVIEWS[req.user.role];
        if (category) {
          if (allowedCats.includes(category)) {
            query += " AND complaints.category = ?";
            params.push(category);
          } else {
            query += " AND 1=0";
          }
        } else {
          const placeholders = allowedCats.map(() => "?").join(",");
          query += ` AND complaints.category IN (${placeholders})`;
          params.push(...allowedCats);
        }
      } else {
        // Admin: category or purview filter is optional
        if (category) {
          query += " AND complaints.category = ?";
          params.push(category);
        } else if (purview === "true" && ROLE_PURVIEWS[req.user.role]) {
          const allowedCats = ROLE_PURVIEWS[req.user.role];
          const placeholders = allowedCats.map(() => "?").join(",");
          query += ` AND complaints.category IN (${placeholders})`;
          params.push(...allowedCats);
        }
      }

      query += " ORDER BY complaints.created_at DESC";
      rows = db.prepare(query).all(...params);
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch complaints" });
  }
});

// Staff: analytics summary
router.get("/stats/summary", authenticate, requireStaff, (req, res) => {
  try {
    const { purview } = req.query;
    const isStaffRestricted = req.user.role !== "admin" && Boolean(ROLE_PURVIEWS[req.user.role]);
    const shouldFilterPurview = isStaffRestricted || (purview === "true" && Boolean(ROLE_PURVIEWS[req.user.role]));

    let filterClause = "";
    const params = [];

    if (shouldFilterPurview) {
      const allowedCats = ROLE_PURVIEWS[req.user.role];
      const placeholders = allowedCats.map(() => "?").join(",");
      filterClause = ` WHERE category IN (${placeholders})`;
      params.push(...allowedCats);
    }

    const total = db
      .prepare(`SELECT COUNT(*) AS c FROM complaints ${filterClause}`)
      .get(...params).c;
    const byStatus = db
      .prepare(`SELECT status, COUNT(*) AS c FROM complaints ${filterClause} GROUP BY status`)
      .all(...params);
    const byCategory = db
      .prepare(`SELECT category, COUNT(*) AS c FROM complaints ${filterClause} GROUP BY category`)
      .all(...params);

    const avgConditions = ["status = 'resolved'"];
    const avgParams = [];
    if (shouldFilterPurview) {
      const allowedCats = ROLE_PURVIEWS[req.user.role];
      const placeholders = allowedCats.map(() => "?").join(",");
      avgConditions.push(`category IN (${placeholders})`);
      avgParams.push(...allowedCats);
    }

    const avgResQuery = `
      SELECT AVG(julianday(updated_at) - julianday(created_at)) AS avg_days
      FROM complaints
      WHERE ${avgConditions.join(" AND ")}
    `;
    const avgResolutionDays = db.prepare(avgResQuery).get(...avgParams).avg_days;

    res.json({
      total,
      byStatus,
      byCategory,
      avgResolutionDays: avgResolutionDays ? Number(avgResolutionDays.toFixed(1)) : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not compute stats" });
  }
});

// Staff: update status, respond, or assign a complaint
router.patch("/:id", authenticate, requireStaff, (req, res) => {
  try {
    const { status, hod_response, response, assigned_to } = req.body;
    const finalResponse = response !== undefined ? response : hod_response;
    const valid = ["submitted", "in_review", "resolved", "rejected"];
    if (status && !valid.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const existing = db.prepare("SELECT * FROM complaints WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Complaint not found" });

    // Enforce purview: non-admin staff can only modify complaints within their department purview
    if (req.user.role !== "admin" && ROLE_PURVIEWS[req.user.role]) {
      const allowedCats = ROLE_PURVIEWS[req.user.role];
      if (!allowedCats.includes(existing.category)) {
        return res.status(403).json({
          error: "Forbidden: You do not have permission to modify complaints outside your department purview.",
        });
      }
    }

    let newAssignedTo = existing.assigned_to;
    let newAssignedToName = existing.assigned_to_name;

    if (assigned_to !== undefined) {
      if (!assigned_to) {
        newAssignedTo = null;
        newAssignedToName = null;
      } else if (assigned_to === "me") {
        newAssignedTo = req.user.id;
        newAssignedToName = req.user.name;
      } else {
        const staffUser = db.prepare("SELECT name FROM users WHERE id = ?").get(assigned_to);
        newAssignedTo = assigned_to;
        newAssignedToName = staffUser ? staffUser.name : "Staff";
      }
    }

    // Only update responder attribution if an actual official response is being provided
    const hasResponseUpdate =
      finalResponse !== undefined && finalResponse !== null && String(finalResponse).trim() !== "";
    const newResponderRole = hasResponseUpdate ? req.user.role : existing.responder_role;
    const newResponderName = hasResponseUpdate ? req.user.name : existing.responder_name;

    db.prepare(
      `UPDATE complaints SET
        status = COALESCE(?, status),
        hod_response = COALESCE(?, hod_response),
        assigned_to = ?,
        assigned_to_name = ?,
        responder_role = ?,
        responder_name = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      status || null,
      finalResponse !== undefined ? finalResponse : null,
      newAssignedTo,
      newAssignedToName,
      newResponderRole,
      newResponderName,
      req.params.id
    );

    const updated = db.prepare("SELECT * FROM complaints WHERE id = ?").get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update complaint" });
  }
});

module.exports = router;
