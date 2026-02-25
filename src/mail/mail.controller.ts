import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('/api/mail')
export class MailController {
  constructor(private readonly mail: MailService) {}

  @Get('test')
  async test(@Query('to') to: string, @Query('key') key: string) {
    if (!to) return { ok: false, message: 'Missing ?to=' };

    const expected = process.env.MAIL_TEST_KEY;
    if (expected && key !== expected) throw new UnauthorizedException('Bad key');

    const result = await this.mail.sendTest(to);
    return { ok: true, result };
  }
}