const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ✉️ Email config (update with your Gmail credentials or app password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your.email@gmail.com',
    pass: 'your-email-password'
  }
});

app.post('/submit-form', (req, res) => {
  const formData = req.body;

  // 🛡️ Honeypot check
  if (formData.website) {
    return res.send('<h2>Spam detected. Submission ignored.</h2>');
  }

  const filePath = path.join(__dirname, 'submissions.json');
  let submissions = [];

  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath);
    submissions = JSON.parse(fileData);
  }

  submissions.push({
    name: formData.name,
    email: formData.email,
    message: formData.message,
    timestamp: new Date().toISOString()
  });

  fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));

  // 📬 Email Notification
  const mailOptions = {
    from: 'your.email@gmail.com',
    to: 'your.email@gmail.com',
    subject: 'New Form Submission',
    text: `Name: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email error:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });

  res.send('<h2>Thank you! Your message was received.</h2><p><a href="/">Go back</a></p>');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

