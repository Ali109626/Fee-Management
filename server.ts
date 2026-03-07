import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("school_v2.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    schoolName TEXT NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    adminId TEXT NOT NULL,
    name TEXT NOT NULL,
    fatherName TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    image TEXT,
    grade TEXT NOT NULL,
    section TEXT NOT NULL,
    rollNumber TEXT NOT NULL,
    portalId TEXT UNIQUE NOT NULL,
    admissionDate TEXT NOT NULL,
    monthlyFee REAL NOT NULL,
    FOREIGN KEY(adminId) REFERENCES admins(id)
  );

  CREATE TABLE IF NOT EXISTS fee_records (
    id TEXT PRIMARY KEY,
    adminId TEXT NOT NULL,
    studentId TEXT NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    totalAmount REAL NOT NULL,
    paidAmount REAL NOT NULL,
    paymentDate TEXT,
    method TEXT,
    status TEXT NOT NULL,
    receiptNumber TEXT,
    remarks TEXT,
    FOREIGN KEY(adminId) REFERENCES admins(id),
    FOREIGN KEY(studentId) REFERENCES students(id)
  );

  CREATE INDEX IF NOT EXISTS idx_students_adminId ON students(adminId);
  CREATE INDEX IF NOT EXISTS idx_students_portalId ON students(portalId);
  CREATE INDEX IF NOT EXISTS idx_fees_adminId ON fee_records(adminId);
  CREATE INDEX IF NOT EXISTS idx_fees_studentId ON fee_records(studentId);
`);

try {
  const row = db.prepare("SELECT 1 as ok").get();
  console.log("Database connection successful:", row);
} catch (err) {
  console.error("Database connection failed:", err);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: process.env.NODE_ENV || "development",
      time: new Date().toISOString()
    });
  });

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // --- API Routes ---

  // Admin Registration
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, schoolName, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 4);
    const id = `ADM-${Date.now()}`;

    try {
      db.prepare("INSERT INTO admins (id, name, email, schoolName, password) VALUES (?, ?, ?, ?, ?)")
        .run(id, name, email, schoolName, hashedPassword);
      
      const token = jwt.sign({ id, role: 'Admin' }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ user: { id, name, email, schoolName }, role: 'Admin' });
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Email already registered" });
      }
      res.status(500).json({ error: `Server error: ${err.message}` });
    }
  });

  // Login (Admin or Student)
  app.post("/api/auth/login", async (req, res) => {
    const { email, password, portalId, loginType } = req.body;

    try {
      if (loginType === 'Admin') {
        const admin: any = db.prepare("SELECT * FROM admins WHERE email = ?").get(email);
        if (admin && await bcrypt.compare(password, admin.password)) {
          const token = jwt.sign({ id: admin.id, role: 'Admin' }, JWT_SECRET);
          res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });
          const { password: _, ...adminData } = admin;
          return res.json({ user: adminData, role: 'Admin' });
        }
      } else {
        const student: any = db.prepare("SELECT * FROM students WHERE portalId = ?").get(portalId);
        if (student) {
          const token = jwt.sign({ id: student.id, role: 'Student' }, JWT_SECRET);
          res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });
          return res.json({ user: student, role: 'Student' });
        }
      }
      res.status(401).json({ error: "Invalid credentials" });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ error: `Server error: ${err.message}` });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not logged in" });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded.role === 'Admin') {
        const admin: any = db.prepare("SELECT id, name, email, schoolName FROM admins WHERE id = ?").get(decoded.id);
        res.json({ user: admin, role: 'Admin' });
      } else {
        const student: any = db.prepare("SELECT * FROM students WHERE id = ?").get(decoded.id);
        res.json({ user: student, role: 'Student' });
      }
    } catch (err: any) {
      console.error("Auth check error:", err);
      res.status(401).json({ error: "Invalid session" });
    }
  });

  // --- Student Routes ---
  app.get("/api/students", authenticate, (req: any, res) => {
    const adminId = req.user.role === 'Admin' ? req.user.id : req.query.adminId;
    const students = db.prepare("SELECT * FROM students WHERE adminId = ?").all(adminId);
    res.json(students);
  });

  app.post("/api/students", authenticate, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Forbidden" });
    const student = req.body;
    db.prepare(`
      INSERT INTO students (id, adminId, name, fatherName, phone, address, image, grade, section, rollNumber, portalId, admissionDate, monthlyFee)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(student.id, req.user.id, student.name, student.fatherName, student.phone, student.address, student.image, student.grade, student.section, student.rollNumber, student.portalId, student.admissionDate, student.monthlyFee);
    res.json(student);
  });

  app.put("/api/students/:id", authenticate, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Forbidden" });
    const student = req.body;
    db.prepare(`
      UPDATE students SET name = ?, fatherName = ?, phone = ?, address = ?, image = ?, grade = ?, section = ?, rollNumber = ?, portalId = ?, admissionDate = ?, monthlyFee = ?
      WHERE id = ? AND adminId = ?
    `).run(student.name, student.fatherName, student.phone, student.address, student.image, student.grade, student.section, student.rollNumber, student.portalId, student.admissionDate, student.monthlyFee, req.params.id, req.user.id);
    res.json(student);
  });

  app.delete("/api/students/:id", authenticate, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Forbidden" });
    db.prepare("DELETE FROM students WHERE id = ? AND adminId = ?").run(req.params.id, req.user.id);
    db.prepare("DELETE FROM fee_records WHERE studentId = ? AND adminId = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // --- Fee Routes ---
  app.get("/api/fees", authenticate, (req: any, res) => {
    const adminId = req.user.role === 'Admin' ? req.user.id : req.query.adminId;
    const fees = db.prepare("SELECT * FROM fee_records WHERE adminId = ?").all(adminId);
    res.json(fees);
  });

  app.post("/api/fees", authenticate, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Forbidden" });
    const fee = req.body;
    db.prepare(`
      INSERT INTO fee_records (id, adminId, studentId, month, year, totalAmount, paidAmount, paymentDate, method, status, receiptNumber, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(fee.id, req.user.id, fee.studentId, fee.month, fee.year, fee.totalAmount, fee.paidAmount, fee.paymentDate, fee.method, fee.status, fee.receiptNumber, fee.remarks);
    res.json(fee);
  });

  app.put("/api/fees/:id", authenticate, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Forbidden" });
    const updates = req.body;
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(", ");
    const values = [...Object.values(updates), req.params.id, req.user.id];
    db.prepare(`UPDATE fee_records SET ${fields} WHERE id = ? AND adminId = ?`).run(...values);
    res.json({ success: true });
  });

  // API 404 handler
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite middleware for development or if dist is missing
  const distPath = path.join(__dirname, "dist");
  if (process.env.NODE_ENV !== "production" || !fs.existsSync(distPath)) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
