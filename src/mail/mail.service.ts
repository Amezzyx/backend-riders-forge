import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MailService {
  private readonly apiKey = process.env.BREVO_API_KEY!;
  private readonly fromEmail = process.env.MAIL_FROM || 'alexkolibjar@gmail.com';
  private readonly fromName = process.env.MAIL_FROM_NAME || 'Riders Forge';

  async sendTest(to: string) {
    if (!this.apiKey) {
      throw new Error('Missing BREVO_API_KEY env var');
    }

    const payload = {
      sender: { email: this.fromEmail, name: this.fromName },
      to: [{ email: to }],
      subject: 'Riders Forge - Test email',
      htmlContent: `<h2>Test OK ✅</h2><p>Tvoj backend vie posielať maily cez Brevo API.</p>`,
    };

    const res = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      payload,
      {
        headers: {
          'api-key': this.apiKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        timeout: 15000,
      },
    );

    return res.data;
  }
}