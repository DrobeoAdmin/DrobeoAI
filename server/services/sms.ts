import twilio from 'twilio';

// Only initialize Twilio client in production
const client = process.env.NODE_ENV === 'production' 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export class SMSService {
  static async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    // In development mode, log the code instead of sending SMS for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 SMS Code for ${phoneNumber}: ${code}`);
      console.log(`Development mode: SMS code logged instead of sent`);
      return true;
    }

    try {
      if (!client) {
        throw new Error('Twilio client not initialized');
      }

      await client.messages.create({
        body: `Your Drobeo verification code is: ${code}. This code expires in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}