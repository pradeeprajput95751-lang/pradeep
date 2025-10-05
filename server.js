const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Allow CORS with credentials (for Render + browser sessions)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "bulkmailer@123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Hardcoded login
const USER = { username: "admin", password: "12345" };

// Routes
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
  if (!req.session.user) {
    console.log("⚠️ Session missing");
    return res.json({ success: false, error: "Not logged in" });
  }

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

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
