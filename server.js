const express = require("express");
const nodemailer = require("nodemailer");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Correct public path (works both locally & Render)
const publicPath = path.join(__dirname, "public");
console.log("🧩 Serving static from:", publicPath);

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

// Dummy login
const USER = { username: "admin", password: "12345" };

// ✅ Root route (fixed)
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// ✅ Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, error: "Invalid username or password" });
  }
});

// ✅ Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ✅ Send Email
app.post("/api/send", async (req, res) => {
  if (!req.session.user) return res.status(403).json({ error: "Not logged in" });

  const { senderEmail, senderPass, subject, message, recipients } = req.body;
  if (!senderEmail || !senderPass || !recipients)
    return res.json({ success: false, error: "Missing details" });

  const list = recipients.split(/\r?\n/).map(e => e.trim()).filter(Boolean);
  if (list.length === 0)
    return res.json({ success: false, error: "No recipients found" });

  // ✅ Use direct SMTP (for Outlook)
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: senderEmail,
      pass: senderPass,
    },
  });

  const results = [];
  for (const to of list) {
    try {
      await transporter.sendMail({
        from: senderEmail,
        to,
        subject: subject || "(No Subject)",
        text: message || "",
      });
      results.push(`${to} ✅ Sent`);
    } catch (err) {
      results.push(`${to} ❌ Failed: ${err.message}`);
    }
  }

  res.json({ success: true, results });
});

// ✅ For unknown routes (Render fallback)
app.use((req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
