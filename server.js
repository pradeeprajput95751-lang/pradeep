import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("trust proxy", 1);
app.use(
  session({
    secret: "super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Admin credentials
const ADMIN_USER = "Pradeep";
const ADMIN_PASS = "12345";

// Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = username;
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, error: "Invalid credentials" });
});

// Logout API
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Send Mail API
app.post("/api/send", async (req, res) => {
  if (!req.session.user) return res.status(403).json({ success: false, error: "Not logged in" });

  const { senderEmail, senderPass, senderName, subject, message, recipients } = req.body;
  if (!senderEmail || !senderPass || !recipients) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  const emails = recipients.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: senderEmail, pass: senderPass },
  });

  const results = [];
  for (const to of emails.slice(0, 30)) {
    try {
      await transporter.sendMail({
        from: `"${senderName || senderEmail}" <${senderEmail}>`,
        to,
        subject,
        text: message,
      });
      results.push({ to, ok: true });
    } catch (e) {
      results.push({ to, ok: false, error: e.message });
    }
    await new Promise(r => setTimeout(r, 200)); // 0.2s delay
  }

  const ok = results.filter(r => r.ok).length;
  res.json({ success: true, count: ok, total: results.length, results });
});

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/launcher", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "public", "launcher.html"));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
