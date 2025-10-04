// server.js
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "bulkmailer@123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Simple admin (change for production)
const USER = {
  username: process.env.ADMIN_USER || "admin",
  password: process.env.ADMIN_PASS || "12345",
};

// serve index
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    return res.json({ success: true });
  }
  return res.json({ success: false, error: "Invalid credentials" });
});

// logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// send mail
app.post("/api/send", async (req, res) => {
  if (!req.session.user) return res.status(403).json({ error: "Not logged in" });

  const {
    provider,     // 'gmail' | 'outlook' | 'custom'
    customHost,
    customPort,
    senderName,
    senderEmail,
    senderPass,
    subject,
    message,
    recipients,
  } = req.body;

  if (!senderEmail || !senderPass || !recipients) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  // Parse recipients - allow comma, semicolon, newline separation
  const list = recipients
    .split(/[\n,;]+/)
    .map((r) => r.trim())
    .filter(Boolean);

  if (list.length === 0) {
    return res.status(400).json({ success: false, error: "No valid recipients" });
  }

  // Choose transporter config
  let transporterConfig;
  if (provider === "gmail") {
    transporterConfig = {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: senderEmail, pass: senderPass },
    };
  } else if (provider === "outlook") {
    transporterConfig = {
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: { user: senderEmail, pass: senderPass },
    };
  } else {
    // custom
    transporterConfig = {
      host: customHost || "smtp.example.com",
      port: customPort ? parseInt(customPort, 10) : 587,
      secure: false,
      auth: { user: senderEmail, pass: senderPass },
    };
  }

  let transporter;
  try {
    transporter = nodemailer.
