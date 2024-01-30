const nodemailer = require('nodemailer');

const sendEmail = async (data, req, res) => {
  try {
    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // Use port 465 for SSL or 587 for TLS
      secure: true, // Use SSL/TLS
      auth: {
        user: process.env.Email, // Your email address
        pass: process.env.Password, // Your email password or app-specific password
      },
    });

    // Email content
    const mailOptions = {
      from: 'your_email@example.com', // Sender address
      to: data.to, // Recipient address
      subject: data.subject, // Email subject
      text: data.text, // Plain text body
      html: data.html, // HTML body (optional)
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Error sending email.' });
  }
};

module.exports = sendEmail;
