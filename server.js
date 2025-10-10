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

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: yourEmail,
        pass: appPassword
      }
    });

    let sent = 0;
    for (const email of emails) {
      try {
        await transporter.sendMail({
          from: `"${senderName}" <${yourEmail}>`,
          to: email,
          subject,
          html: messageBody
        });
        sent++;
        await new Promise((r) => setTimeout(r, 100)); // 0.1 sec delay
      } catch (e) {
        console.error("❌ Error sending to:", email, e.message);
      }
    }

    res.json({ ok: true, count: sent });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Server running on port " + PORT));
