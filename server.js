const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "bulkmailer@123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Hardcoded login (simple)
const USER = { username: "admin", password: "12345" };

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Login route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, error: "Invalid credentials" });
  }
});

// Logout route
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Send mail route
app.post("/api/send", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not logged in" });

  const { senderName, senderEmail, senderPass, subject, message, recipients } =
    req.body;

  try {
    const emails = recipients
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: senderPass, // Gmail App Password
      },
    });

    for (const email of emails) {
      await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject,
        text: message,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
