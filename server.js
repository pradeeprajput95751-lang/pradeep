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
  saveUninitialized: true
}));

const USER = { username: "admin", password: "12345" };

// ✅ Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.json({ success: true });
  } else res.json({ success: false, error: "Invalid credentials" });
});

// ✅ Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ✅ Mail Send
app.post("/api/send", async (req, res) => {
  if (!req.session.user) return res.status(403).json({ error: "Not logged in" });

  const { senderEmail, senderPass, subject, message, recipients } = req.body;
  const list = recipients.split(/\r?\n/).filter(e => e);

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: { user: senderEmail, pass: senderPass },
  });

  const results = [];
  for (const to of list) {
    try {
      await transporter.sendMail({
        from: senderEmail,
        to,
        subject,
        text: message,
      });
      results.push(`${to} ✅`);
    } catch (err) {
      results.push(`${to} ❌ ${err.message}`);
    }
  }

  res.json({ success: true, results });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
