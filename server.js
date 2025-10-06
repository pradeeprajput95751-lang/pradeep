// server.js
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
// serve React build
app.use(express.static(path.join(__dirname, "frontend", "build")));

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "12345";

// LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = username;
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: "Invalid credentials" });
});

// CHECK SESSION
app.get("/api/whoami", (req, res) => {
  res.json({ loggedIn: !!req.session.user, user: req.session.user || null });
});

// LOGOUT
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// SEND - expects senderName, senderEmail, senderPass (Gmail App Password), subject, message, recipients
// NOTE: minimum delay enforced = 300ms
app.post("/api/send", async (req, res) => {
  if (!req.session.user) return res.status(403).json({ success: false, error: "Not logged in" });

  const { senderName, senderEmail, senderPass, subject, message, recipients } = req.body || {};
  if (!senderEmail || !senderPass || !recipients) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  // parse recipients (newline, comma, semicolon)
  const list = recipients.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
  if (list.length === 0) return res.status(400).json({ success: false, error: "No recipients found" });

  // Nodemailer transporter using Gmail (App Password)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: senderEmail, pass: senderPass },
  });

  const minDelay = 300; // enforced minimum delay in ms
  const delay = minDelay; // fixed to 300ms by design for safety

  const results = [];
  // send up to 30 recipients (slice)
  for (const to of list.slice(0, 30)) {
    try {
      await transporter.sendMail({
        from: `"${senderName || senderEmail}" <${senderEmail}>`,
        to,
        subject: subject || "(no subject)",
        text: message || "",
      });
      results.push({ to, ok: true });
    } catch (err) {
      results.push({ to, ok: false, error: err.message || String(err) });
    }
    // delay to avoid throttling
    await new Promise(r => setTimeout(r, delay));
  }

  const successCount = results.filter(r => r.ok).length;
  res.json({ success: true, sent: successCount, total: results.length, results });
});

// Catch-all: serve React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
