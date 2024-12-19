// /api/sendEmail.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      firstName,
      lastName,
      gender,
      phone,
      email,
      dob,
      agreeToTexts,
      tryoutType,
      selectedTrial
    } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // or true if using TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const message = {
      from: 'no-reply@example.com',
      to: 'your-email@example.com', // Replace with your email
      subject: 'New Registration Details',
      text: `
        A new user has registered:

        First Name: ${firstName}
        Last Name: ${lastName}
        Gender: ${gender}
        Email: ${email}
        Phone: ${phone}
        DOB: ${dob}
        Subscribed to texts: ${agreeToTexts ? 'Yes' : 'No'}

        Chosen Tryout Type: ${tryoutType}
        Selected Trial: ${selectedTrial}
      `
    };

    try {
      await transporter.sendMail(message);
      return res.status(200).json({ message: 'Email sent.' });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send email.' });
    }
  } else {
    res.status(405).end();
  }
}
