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

// 🔹 LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// 🔹 SEND MAIL
app.post("/api/send", async (req, res) => {
  if (!req.session.user)
    return res.status(403).json({ success: false, message: "Not logged in" });

  const { senderName, email, password, subject, message, recipients } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: email, pass: password }
    });

    const emailList = recipients.split(",").map(e => e.trim()).filter(Boolean);

    for (const to of emailList) {
      await transporter.sendMail({
        from: `"${senderName}" <${email}>`,
        to,
        subject,
        text: message
      });
    }

    res.json({ success: true, sent: emailList.length });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 LOGOUT
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// 🔹 ROUTES
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/launcher", (req, res) => {
  if (req.session.user)
    res.sendFile(path.join(__dirname, "public", "launcher.html"));
  else
    res.redirect("/");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
