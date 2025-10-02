const express = require("express");
const nodemailer = require("nodemailer");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET || "bulkmailer@123",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Hardcoded login (admin panel)
const USER = { username: "admin", password: "ChangeMe123" };

// API: Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, error: "Invalid credentials" });
  }
});

// API: Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// API: Send Mail
app.post("/api/send", async (req, res) => {
  if (!req.session.user) {
    return res.status(403).json({ error: "Not logged in" });
  }

  const { senderName, senderEmail, senderPass, subject, message, recipients } = req.body;

  if (!senderEmail || !senderPass) {
    return res.json({ error: "Sender email & password required" });
  }

  const list = recipients.split("\n").map(e => e.trim()).filter(e => e);
  const max = 30;
  const toSend = list.slice(0, max);

  const transporter = nodemailer.createTransport({
    service: "Outlook",
    auth: {
      user: senderEmail,
      pass: senderPass
    }
  });

  let results = [];
  for (let email of toSend) {
    try {
      await transporter.sendMail({
        from: senderName ? `"${senderName}" <${senderEmail}>` : senderEmail,
        to: email,
        subject,
        text: message
      });
      results.push({ email, status: "✅ Sent" });
    } catch (err) {
      results.push({ email, status: "❌ Failed", error: err.message });
    }
  }

  res.json({ success: true, sent: results });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
