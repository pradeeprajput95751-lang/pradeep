const express = require("express");
const nodemailer = require("nodemailer");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Public folder path
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.use(session({
  secret: "bulkmailer@123",
  resave: false,
  saveUninitialized: true
}));

// Dummy login
const USER = { username: "admin", password: "12345" };

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, error: "Invalid login" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.post("/api/send", async (req, res) => {
  const { senderEmail, senderPass, subject, message, recipients } = req.body;

  if (!senderEmail || !senderPass || !recipients)
    return res.json({ success: false, error: "Missing info" });

  const list = recipients.split(/\r?\n/).map(x => x.trim()).filter(Boolean);

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: { user: senderEmail, pass: senderPass }
  });

  const results = [];

  for (const to of list) {
    try {
      await transporter.sendMail({ from: senderEmail, to, subject, text: message });
      results.push(`${to} ✅ Sent`);
    } catch (err) {
      results.push(`${to} ❌ ${err.message}`);
    }
  }

  res.json({ success: true, results });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
