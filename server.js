const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "Pradeep8923" && password === "Pradeep8923@") {
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, error: "Invalid username or password" });
});

app.post("/send-bulk", async (req, res) => {
  try {
    const { senderName, yourEmail, appPassword, subject, messageBody, emails } = req.body;
    if (!yourEmail || !appPassword) {
      return res.status(400).json({ ok: false, error: "Missing credentials" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: yourEmail, pass: appPassword },
    });

    let count = 0;

    // ⚡ Parallel + fast sending (no heavy delay)
    for (const email of emails) {
      transporter.sendMail({
        from: `"${senderName}" <${yourEmail}>`,
        to: email,
        subject,
        html: messageBody,
      }).then(() => {}).catch(() => {});
      count++;
      await new Promise((r) => setTimeout(r, 50)); // ⚡ only 50ms delay between mails
    }

    res.json({ ok: true, count });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
