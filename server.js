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

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "12345";

// login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = username;
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: "Invalid credentials" });
});

// logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// send
app.post("/api/send", async (req, res) => {
  if (!req.session.user) return res.status(403).json({ success: false, error: "Not logged in" });

  const { senderEmail, senderPass, senderName, subject, message, recipients } = req.body || {};
  if (!senderEmail || !senderPass || !recipients)
    return res.status(400).json({ success: false, error: "Missing required fields" });

  const list = recipients
    .split(/[\n,;]+/)
    .map((x) => x.trim())
    .filter(Boolean);

  // create transporter (Gmail App Password expected)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: senderEmail, pass: senderPass }
  });

  const delay = 200; // fixed 200ms between mails
  const results = [];

  for (const to of list.slice(0, 30)) {
    try {
      await transporter.sendMail({
        from: `"${senderName || senderEmail}" <${senderEmail}>`,
        to,
        subject,
        text: message
      });
      results.push({ to, ok: true });
    } catch (err) {
      results.push({ to, ok: false, error: err.message });
    }
    // delay
    await new Promise((r) => setTimeout(r, delay));
  }

  const successCount = results.filter(r => r.ok).length;
  return res.json({ success: true, count: successCount, total: results.length, results });
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/launcher", (req, res) =>
  !req.session.user ? res.redirect("/") : res.sendFile(path.join(__dirname, "public", "launcher.html"))
);

app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
