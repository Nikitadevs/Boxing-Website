// Install twilio: npm install twilio
import twilio from 'twilio';

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { phone, agreeToTexts, tryoutType, selectedTrial } = req.body;
    if (agreeToTexts && phone) {
      try {
        await client.messages.create({
          body: `Reminder: Your ${tryoutType} tryout is at ${selectedTrial}. Good luck!`,
          from: process.env.TWILIO_FROM_NUMBER,
          to: phone
        });
        return res.status(200).json({ message: 'Text sent.' });
      } catch (error) {
        return res.status(500).json({ message: 'Failed to send SMS.' });
      }
    }
    return res.status(200).json({ message: 'No SMS sent.' });
  } else {
    res.status(405).end();
  }
}
