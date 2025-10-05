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

// 🟢 LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// 🟢 BULK MAIL FUNCTION
async function sendBulkEmails({ senderName, email, password, subject, message, recipients }) {
  const emailList = recipients.split(",").map(e => e.trim()).filter(Boolean);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: email, pass: password }
  });

  let sentCount = 0;
  for (const to of emailList) {
    try {
      await transporter.sendMail({
        from: `"${senderName}" <${email}>`,
        to,
        subject,
        text: message
      });
      console.log(`✅ Sent to ${to}`);
      sentCount++;
      await new Promise(res => setTimeout(res, 1500)); // 1.5 sec delay
    } catch (err) {
      console.error(`❌ Failed to send to ${to}: ${err.message}`);
    }
  }
  return sentCount;
}

// 🟢 SEND MAIL ROUTE
app.post("/api/send", async (req, res) => {
  if (!req.session.user)
    return res.status(403).json({ success: false, message: "Not logged in" });

  const { senderName, email, password, subject, message, recipients } = req.body;
  try {
    const sentCount = await sendBulkEmails({ senderName, email, password, subject, message, recipients });
    res.json({ success: true, sent: sentCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/launcher", (req, res) => {
  if (req.session.user)
    res.sendFile(path.join(__dirname, "public", "launcher.html"));
  else res.redirect("/");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
