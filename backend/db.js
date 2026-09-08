const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(path.join(dataDir, "grievance.db"));

db.pragma = function (pragmaStr) {
  return db.exec(`PRAGMA ${pragmaStr};`);
};

db.pragma("journal_mode = WAL");

// Initialize schema with all supported roles and assignment fields
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student','hod','proctor','warden','repairman','admin')),
    department TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    department TEXT,
    attachment_path TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','in_review','resolved','rejected')),
    hod_response TEXT,
    assigned_to TEXT,
    assigned_to_name TEXT,
    responder_role TEXT,
    responder_name TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
  );
`);

// Run migrations on existing database if needed
try {
  const tableSql = db
    .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
    .get();
  if (tableSql && tableSql.sql && !tableSql.sql.includes("proctor")) {
    db.exec(`
      PRAGMA foreign_keys = OFF;
      CREATE TABLE IF NOT EXISTS users_temp (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student','hod','proctor','warden','repairman','admin')),
        department TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      INSERT INTO users_temp (id, name, email, password, role, department, created_at)
        SELECT id, name, email, password, role, department, created_at FROM users;
      DROP TABLE users;
      ALTER TABLE users_temp RENAME TO users;
      PRAGMA foreign_keys = ON;
    `);
  }
} catch (e) {
  console.error("Migration notice for users table:", e.message);
}

try {
  const compColumns = db.prepare("PRAGMA table_info(complaints)").all().map((c) => c.name);
  if (!compColumns.includes("assigned_to")) {
    db.exec("ALTER TABLE complaints ADD COLUMN assigned_to TEXT;");
  }
  if (!compColumns.includes("assigned_to_name")) {
    db.exec("ALTER TABLE complaints ADD COLUMN assigned_to_name TEXT;");
  }
  if (!compColumns.includes("responder_role")) {
    db.exec("ALTER TABLE complaints ADD COLUMN responder_role TEXT;");
  }
  if (!compColumns.includes("responder_name")) {
    db.exec("ALTER TABLE complaints ADD COLUMN responder_name TEXT;");
  }
} catch (e) {
  console.error("Migration notice for complaints table columns:", e.message);
}

// Performance indexes for frequent queries, status filtering, and sorting
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON complaints(student_id);
  CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
  CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
  CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);
  CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
`);

module.exports = db;

