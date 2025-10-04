const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "bulkmailer@123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Login user
const USER = { username: "admin", password: "12345" };

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, error: "Invalid credentials" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.post("/api/send", async (req, res) => {
  if (!req.session.user) return res.status(403).json({ error: "Not logged in" });

  const { senderName, senderEmail, senderPass, subject, message, recipients } = req.body;

  try {
    const emails = recipients.split(/\r?\n/).map((e) => e.trim()).filter(Boolean);

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com", // Outlook SMTP
      port: 587,
      secure: false,
      auth: { user: senderEmail, pass: senderPass },
    });

    const results = [];
    for (const email of emails) {
      try {
        await transporter.sendMail({
          from: `"${senderName}" <${senderEmail}>`,
          to: email,
          subject,
          text: message,
        });
        results.push(`${email} ✅ Sent`);
      } catch (err) {
        results.push(`${email} ❌ ${err.message}`);
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
