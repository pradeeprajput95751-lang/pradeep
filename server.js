const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ✅ Correct path setup for Render & Local
app.use(express.static(path.join(__dirname, "public")));

app.post("/send-bulk", async (req, res) => {
  try {
    const { senderName, yourEmail, appPassword, subject, messageBody, emails } = req.body;

    if (!yourEmail || !appPassword) {
      return res.status(400).json({ ok: false, error: "❌ Not logged in" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: yourEmail, pass: appPassword },
    });

    let count = 0;
    for (const email of emails) {
      const mailOptions = {
        from: `"${senderName}" <${yourEmail}>`,
        to: email,
        subject,
        html: messageBody,
      };

      await transporter.sendMail(mailOptions);
      count++;

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    res.json({ ok: true, count });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ Fix: Send login.html for root route (/)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Fallback for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
