import express from "express";
import session from "express-session";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "bulksecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }
  })
);

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "12345";

// 🟢 LOGIN API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// 🟢 CHECK LOGIN
app.get("/api/check", (req, res) => {
  if (req.session.user) res.json({ loggedIn: true });
  else res.json({ loggedIn: false });
});

// 🟢 SEND MAIL
app.post("/api/send", async (req, res) => {
  if (!req.session.user) return res.status(403).json({ success: false, message: "Not logged in" });

  const { senderName, email, password, subject, message, recipients } = req.body;
  const emails = recipients.split(",").map(e => e.trim()).filter(Boolean);

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: email, pass: password },
    });

    for (const to of emails) {
      await transporter.sendMail({
        from: `"${senderName}" <${email}>`,
        to,
        subject,
        text: message,
      });
    }

    res.json({ success: true, sent: emails.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send" });
  }
});

// 🟢 LOGOUT
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// 🟢 ROUTES
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/launcher", (req, res) => {
  if (req.session.user) res.sendFile(path.join(__dirname, "public", "launcher.html"));
  else res.redirect("/");
});

// 🟢 START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
