const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

const usersDb = './users.json'; // User data अलग फाइल में

// [REGISTER USER] (Optional, manual step से users.json एडिट भी कर सकते हैं)

// [LOGIN API]
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersDb));
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).send('Invalid Email');
    bcrypt.compare(password, user.password, (err, valid) => {
        if (!valid) return res.status(401).send('Wrong Password');
        const token = jwt.sign({ email: user.email }, 'secret123', { expiresIn: '1h' });
        res.json({ token });
    });
});

// [SEND BULK MAIL API]
app.post('/api/sendmail', (req, res) => {
    const { authorization } = req.headers;
    if(!authorization) return res.status(401).send('Login First');
    try { jwt.verify(authorization.replace('Bearer ', ''), 'secret123'); } catch { return res.status(401).send('Token Invalid'); }
    const { senderName, senderEmail, senderPass, subject, template, clientEmails } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Gmail SMTP
        auth: { user: senderEmail, pass: senderPass }
    });

    let emails = clientEmails.split(',').map(e=>e.trim());
    let promises = emails.map(email => transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject: subject,
        html: template
    }));

    Promise.all(promises)
        .then(() => res.send('All Emails Sent!'))
        .catch(err => res.status(500).send('Send Failed: '+err.message));
});

// Start server
app.listen(3000, () => console.log('Server listening on 3000'));
