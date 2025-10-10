const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
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
  return res.status(401).json({ ok: false, error: "Invalid username or password" });
});

app.post("/send-bulk", async (req, res) => {
  const { senderName, yourEmail, appPassword, subject, messageBody, emails } = req.body;
  if (!yourEmail || !appPassword || !emails?.length) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: yourEmail, pass: appPassword },
  });

  let results = [];

  // Send all mails in parallel (fast!)
  await Promise.all(
    emails.map(async (email) => {
      const namePart = email.split("@")[0];
      const customizedMessage = messageBody.replace(/{{name}}/g, namePart);
      try {
        await transporter.sendMail({
          from: `"${senderName}" <${yourEmail}>`,
          to: email,
          subject,
          html: customizedMessage,
        });
        results.push({ to: email, ok: true });
      } catch (e) {
        results.push({ to: email, ok: false, error: e.message });
      }
    })
  );

  const sentCount = results.filter((r) => r.ok).length;
  res.json({ ok: true, count: sentCount });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
