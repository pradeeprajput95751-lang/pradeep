const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// Serve launcher page
app.get('/launcher', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'launcher.html'));
});

// Send Bulk Emails
app.post('/send-bulk', async (req, res) => {
  const { senderName, yourEmail, appPassword, subject, messageBody, emails } = req.body;
  if (!yourEmail || !appPassword) {
    return res.status(400).json({ ok: false, error: 'Not logged in' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: yourEmail,
        pass: appPassword,
      },
    });

    let sentCount = 0;

    // Send 30 emails per 0.2 seconds
    for (let i = 0; i < emails.length; i++) {
      const mailOptions = {
        from: `${senderName} <${yourEmail}>`,
        to: emails[i],
        subject: subject,
        text: messageBody,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) console.log('❌', emails[i], err.message);
        else console.log('✅ Sent to', emails[i]);
      });

      sentCount++;

      // Delay for 0.2 sec after every 30 emails
      if (sentCount % 30 === 0) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    res.json({ ok: true, sentCount });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, error: err.message });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));
