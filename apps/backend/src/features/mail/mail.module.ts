import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { TelegramService } from './telegram.service';
import { MailController } from './mail.controller';

@Module({
  controllers: [MailController],
  providers: [MailService, TelegramService],
  exports: [MailService, TelegramService],
})
export class MailModule {}
