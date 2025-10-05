// server.js
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import sgMail from "@sendgrid/mail";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("trust proxy", 1);
app.use(session({
  name: process.env.SESSION_NAME || "bulk.sid",
  secret: process.env.SESSION_SECRET || "change_this_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: true,
    maxAge: 24*60*60*1000
  }
}));

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "12345";

// SendGrid setup (optional)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("SendGrid enabled");
} else {
  console.log("SendGrid NOT provided — running in demo mode (no real emails).");
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = username;
    req.session.save(err => {
      if (err) return res.status(500).json({ success:false, error: "session save failed" });
      return res.json({ success: true });
    });
  } else {
    return res.status(401).json({ success:false, error: "Invalid credentials" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(()=> res.json({ success:true }));
});

app.get("/api/whoami", (req,res) => {
  res.json({ loggedIn: !!req.session.user, user: req.session.user || null });
});

// Send endpoint
// Accepts: senderName, senderEmail, subject, message, recipients (string), delayMs (optional)
// IMPORTANT: enforce minimum delay = 300ms to avoid abuse
app.post("/api/send", async (req, res) => {
  if (!req.session.user) return res.status(403).json({ success:false, error: "Not logged in" });

  const { senderName, senderEmail, subject, message, recipients, delayMs } = req.body || {};
  if (!senderEmail || !recipients) return res.status(400).json({ success:false, error: "Missing senderEmail or recipients" });

  // parse recipients (newline, comma, semicolon)
  const list = recipients.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
  if (!list.length) return res.status(400).json({ success:false, error: "No recipients found" });

  // enforce minimum delay 300ms
  let delay = parseInt(delayMs,10) || 500;
  if (isNaN(delay) || delay < 300) delay = 300;

  const results = [];

  // demo mode if no SendGrid key
  if (!SENDGRID_API_KEY) {
    for (const to of list) {
      // simulate success
      results.push({ to, success: true, info: "demo" });
      await sleep(delay);
    }
    return res.json({ success:true, mode:"demo", sent: results.length, results });
  }

  // real send with SendGrid
  for (const to of list) {
    try {
      const msg = {
        to,
        from: senderEmail, // note: SendGrid may require verified sender depending on plan
        subject: subject || "(no subject)",
        text: message || ""
      };
      await sgMail.send(msg);
      results.push({ to, success: true });
    } catch (err) {
      console.error("SendGrid error for", to, err && err.message);
      results.push({ to, success: false, error: err && (err.message || JSON.stringify(err)) });
    }
    await sleep(delay);
  }

  return res.json({ success:true, mode:"sendgrid", sent: results.filter(r=>r.success).length, results });
});

// Serve pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/launcher", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  return res.sendFile(path.join(__dirname, "public", "launcher.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
