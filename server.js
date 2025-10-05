// server.js
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const isProd = process.env.NODE_ENV === "production";

// If behind proxy (Render), trust proxy so secure cookies work
if (isProd) app.set("trust proxy", 1);

// CORS - allow origin and credentials
// If you deploy, set FRONTEND_ORIGIN to your site (e.g. https://your-app.onrender.com)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || true; // `true` => reflect origin
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Static + body
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session - cookie settings depend on environment
app.use(
  session({
    name: process.env.SESSION_NAME || "bulk.sid",
    secret: process.env.SESSION_SECRET || "bulkmailer@123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd, // true in production (HTTPS required)
      sameSite: isProd ? "none" : "lax", // 'none' needed for cross-site cookies on HTTPS
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Simple admin (use env vars in production)
const USER = {
  username: process.env.ADMIN_USER || "admin",
  password: process.env.ADMIN_PASS || "12345",
};

// Debug middleware (optional) - prints cookie header & session id
app.use((req, res, next) => {
  console.log("-> Request:", req.method, req.url);
  // console.log("Cookies:", req.headers.cookie); // uncomment if you want raw cookie printed
  // console.log("Session:", req.session);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// whoami for debugging session
app.get("/api/whoami", (req, res) => {
  res.json({ loggedIn: !!req.session.user, user: req.session.user || null });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username);
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    // save session then respond
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ success: false, error: "Session save failed" });
      }
      return res.json({ success: true });
    });
  } else {
    return res.json({ success: false, error: "Invalid credentials" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Send mail (requires logged in)
app.post("/api/send", async (req, res) => {
  if (!req.session.user) {
    console.warn("Send blocked - no session");
    return res.status(401).json({ success: false, error: "Not logged in" });
  }

  const { senderName, senderEmail, senderPass, subject, message, recipients } = req.body;

  if (!senderEmail || !senderPass || !recipients) {
    return res.status(400).json({ success: false, error: "Missing sender/recipients" });
  }

  const list = recipients
    .split(/[\n,;]+/)
    .map((r) => r.trim())
    .filter(Boolean);

  if (list.length === 0) {
    return res.status(400).json({ success: false, error: "No valid recipient addresses" });
  }

  // Using Gmail or Outlook or custom - for simplicity here use Gmail SMTP as example
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    secure: false,
    auth: { user: senderEmail, pass: senderPass },
  });

  const results = [];
  for (const to of list) {
    try {
      const info = await transporter.sendMail({
        from: senderName ? `"${senderName}" <${senderEmail}>` : senderEmail,
        to,
        subject: subject || "(no subject)",
        text: message || "",
      });
      results.push({ to, success: true, info: info.messageId || null });
    } catch (err) {
      results.push({ to, success: false, error: err.message });
    }
  }

  return res.json({ success: true, results });
});

// Fallback
app.use((req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
