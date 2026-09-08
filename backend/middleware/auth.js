const jwt = require("jsonwebtoken");

const STAFF_ROLES = ["hod", "proctor", "warden", "repairman", "admin"];

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}

function requireStaff(req, res, next) {
  return requireRole(STAFF_ROLES)(req, res, next);
}

module.exports = { authenticate, requireRole, requireStaff, STAFF_ROLES };
