// server.js
import express from "express";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Setup dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Bulk Mail API
app.post("/send-bulk", async (req, res) => {
  const { senderName, yourEmail, appPassword, subject, messageBody, emails } = req.body;

  if (!yourEmail || !appPassword) {
    return res.status(400).json({ ok: false, error: "Not logged in" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: yourEmail,
        pass: appPassword,
      },
    });

    // Sequential sending with delay
    const sendEmail = (to) =>
      new Promise((resolve) => {
        const mailOptions = {
          from: `${senderName} <${yourEmail}>`,
          to,
          subject,
          text: messageBody,
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) console.log(`❌ ${to} failed: ${err.message}`);
          else console.log(`✅ Sent to ${to}`);
          setTimeout(resolve, 200); // delay between emails
        });
      });

    for (let i = 0; i < emails.length; i++) {
      await sendEmail(emails[i]);
    }

    console.log("✅ All emails sent successfully!");
    res.json({ ok: true, count: emails.length });
  } catch (err) {
    console.error("Mail error:", err);
    res.json({ ok: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
