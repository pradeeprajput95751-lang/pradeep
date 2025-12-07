const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/send-bulk", async (req, res) => {
  const { senderName, gmail, appPassword, subject, message, recipients } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmail,
        pass: appPassword
      }
    });

    for (let email of recipients) {
      await transporter.sendMail({
        from: `${senderName} <${gmail}>`,
        to: email,
        subject: subject,
        text: message,
      });
    }

    res.send("All Emails Sent Successfully!");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error sending emails");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
