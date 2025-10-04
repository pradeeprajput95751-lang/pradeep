const express = require("express");
const nodemailer = require("nodemailer");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ public folder path fix
const publicPath = path.resolve(__dirname, "public");
console.log("📁 Serving static from:", publicPath);

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "bulkmailer@123",
    resave: false,
    saveUninitialized: true,
  })
);

const USER = { username: "admin", password: "12345" };

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.json({ success: true });
  } else res.json({ success: false, error: "Invalid login" });
});

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Send mail
app.post("/api/send", async (req, res) => {
  if (!req.session.user)
    return res.status(403).json({ error: "Not logged in" });

  const { senderEmail, senderPass, subject, message, recipients } = req.body;
  if (!senderEmail || !senderPass || !recipients)
    return res.json({ success: false, error: "Missing fields" });

  const emails = recipients.split(/\r?\n/).map(e => e.trim()).filter(Boolean);
  if (!emails.length)
    return res.json({ success: false, error: "No valid emails" });

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: { user: senderEmail, pass: senderPass },
  });

  const results = [];
  for (const to of emails) {
    try {
      await transporter.sendMail({
        from: senderEmail,
        to,
        subject: subject || "(No Subject)",
        text: message || "",
      });
      results.push(`${to} ✅ Sent`);
    } catch (err) {
      results.push(`${to} ❌ ${err.message}`);
    }
  }

  res.json({ success: true, results });
});

// Fallback for Render
app.use((req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () => console.log(`🚀 Running at http://localhost:${PORT}`));
