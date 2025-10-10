const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Login API (simple hardcoded login)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Hardcoded credentials
  const validUsername = "Pradeep8923";
  const validPassword = "Pradeep8923@";

  if (username === validUsername && password === validPassword) {
    return res.json({ ok: true });
  } else {
    return res.status(401).json({ ok: false, error: "Invalid login" });
  }
});

// ✅ Bulk Mail Send
app.post("/send-bulk", async (req, res) => {
  const { senderName, yourEmail, appPassword, subject, messageBody, emails } = req.body;

  if (!yourEmail || !appPassword || !emails?.length) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: yourEmail,
      pass: appPassword,
    },
  });

  let results = [];
  await Promise.all(
    emails.map(async (email) => {
      const namePart = email.split("@")[0];
      const customMsg = messageBody.replace(/{{name}}/g, namePart);
      try {
        await transporter.sendMail({
          from: `"${senderName}" <${yourEmail}>`,
          to: email,
          subject,
          html: customMsg,
        });
        results.push({ to: email, ok: true });
      } catch (err) {
        results.push({ to: email, ok: false, error: err.message });
      }
    })
  );

  res.json({
    ok: true,
    count: results.filter((r) => r.ok).length,
  });
});

// ✅ Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
