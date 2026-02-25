import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('api/mail')
export class MailController {
  constructor(private readonly mail: MailService) {}

  @Get('test')
  async test(@Query('to') to: string, @Query('key') key: string) {
    if (!process.env.MAIL_TEST_KEY || key !== process.env.MAIL_TEST_KEY) {
      throw new UnauthorizedException('Bad key');
    }
    await this.mail.sendTest(to);
    return { ok: true };
  }
}
