const express = require("express");
const nodemailer = require("nodemailer");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "bulkmailer@123",
  resave: false,
  saveUninitialized: true
}));

// Hardcoded login
const USER = { username: "admin", password: "12345" };

// ✅ Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, error: "Invalid credentials" });
  }
});

// ✅ Logout API
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ✅ Mail Send API
app.post("/api/send", async (req, res) => {
  if (!req.session.user) return res.status(403).json({ error: "Not logged in" });

  const { senderEmail, senderPass, subject, message, recipients } = req.body;
  if (!senderEmail || !senderPass || !recipients) {
    return res.json({ success: false, error: "Missing fields" });
  }

  const list = recipients.split(/\r?\n/).filter(e => e);
  if (list.length === 0) return res.json({ success: false, error: "No recipients" });

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: { user: senderEmail, pass: senderPass }
  });

  const results = [];

  for (const to of list) {
    try {
      await transporter.sendMail({
        from: senderEmail,
        to,
        subject: subject || "(No Subject)",
        text: message || ""
      });
      results.push(`${to} ✅ Sent`);
    } catch (err) {
      results.push(`${to} ❌ Failed: ${err.message}`);
    }
  }

  res.json({ success: true, results });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
