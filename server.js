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

    // Function to send a single mail with delay
    const sendEmail = (to) => {
      return new Promise((resolve) => {
        const mailOptions = {
          from: `${senderName} <${yourEmail}>`,
          to,
          subject,
          text: messageBody,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) console.log(`❌ Failed: ${to} — ${err.message}`);
          else console.log(`✅ Sent: ${to}`);
          setTimeout(resolve, 300); // 0.3 sec delay between mails
        });
      });
    };

    // Sequential sending (prevents Gmail blocking)
    for (let i = 0; i < emails.length; i++) {
      await sendEmail(emails[i]);
    }

    console.log('✅ All emails sent');
    res.json({ ok: true, count: emails.length });
  } catch (err) {
    console.error('Error:', err);
    res.json({ ok: false, error: err.message });
  }
});
