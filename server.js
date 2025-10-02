const express = require("express");
const nodemailer = require("nodemailer");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "bulkmailer@123",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const USER = { username: "admin", password: "ChangeMe123" };

// Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.json({ success: true });
  } else res.json({ success: false, error: "Invalid credentials" });
});

// Logout API
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Send Mail API
app.post("/api/send", async (req, res) => {
  if (!req.session.user) return res.status(403).json({ error: "Not logged in" });

  const { senderName, senderEmail, senderPass, subject, message, recipients } = req.body;
  if (!senderEmail || !senderPass) return res.json({ error: "Sender email & password required" });

  let list = recipients.split(/\r?\n/).map(e => e.trim()).filter(e => e);
  if (list.length > 30) list = list.slice(0, 30);

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: { user: senderEmail, pass: senderPass },
    tls: { ciphers: "SSLv3" }
  });

  const results = [];
  for (const to of list) {
    try {
      await transporter.sendMail({
        from: senderName ? `"${senderName}" <${senderEmail}>` : senderEmail,
        to,
        subject: subject || "(No Subject)",
        text: message || ""
      });
      results.push({ to, status: "✅ Sent" });
    } catch (err) {
      results.push({ to, status: "❌ Failed", error: err.message });
    }
  }

  res.json({ success: true, results });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
