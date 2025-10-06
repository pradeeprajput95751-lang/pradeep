import express from "express";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Bulk mail route
app.post("/send-bulk", async (req, res) => {
  const { senderName, yourEmail, appPassword, subject, messageBody, emails } = req.body;

  if (!yourEmail || !appPassword) {
    return res.status(400).json({ ok: false, error: "Not logged in" });
  }

  try {
    // Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: yourEmail,
        pass: appPassword,
      },
    });

    // Function to send mail with delay
    const sendEmail = async (to) => {
      const mailOptions = {
        from: `${senderName || "Bulk Sender"} <${yourEmail}>`,
        to,
        subject,
        text: messageBody,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Sent to ${to}`);
      } catch (err) {
        console.log(`❌ Failed: ${to} - ${err.message}`);
      }

      // Delay between mails (0.2 sec)
      await new Promise((resolve) => setTimeout(resolve, 200));
    };

    // Sequential sending
    for (let i = 0; i < emails.length; i++) {
      await sendEmail(emails[i]);
    }

    console.log("✅ All emails sent!");
    res.json({ ok: true, count: emails.length });
  } catch (err) {
    console.error("Error sending emails:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
