import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "12345";

app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "bulksecret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));

// 🔐 LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, error: "Invalid credentials" });
  }
});

// 🧾 WHOAMI
app.get("/api/whoami", (req, res) => {
  res.json({ loggedIn: !!req.session.user });
});

// 🚪 LOGOUT
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// 📧 SEND EMAILS
app.post("/api/send", async (req, res) => {
  if (!req.session.user) {
    return res.json({ success: false, error: "Not logged in" });
  }

  const { senderName, senderEmail, senderPass, subject, message, recipients } = req.body;
  const emailList = recipients.split(/[\n,]+/).map(e => e.trim()).filter(Boolean);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: senderEmail, pass: senderPass },
    });

    const results = [];
    for (const to of emailList) {
      try {
        await transporter.sendMail({
          from: `${senderName} <${senderEmail}>`,
          to,
          subject,
          html: `<div style="font-family:Arial;">${message}</div>`,
        });
        results.push({ to, success: true });
      } catch (err) {
        results.push({ to, success: false, error: err.message });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// 🏠 DEFAULT ROUTE
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
