import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { ResendWebhookController } from './resend-webhook.controller';
import { NotificationsService } from './notifications.service';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, MailModule],
  controllers: [NotificationsController, ResendWebhookController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
