import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendTest(to: string) {
    return this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'Riders Forge – test email',
      html: `<h2>OK ✅</h2><p>SMTP funguje.</p>`,
    });
  }
}
