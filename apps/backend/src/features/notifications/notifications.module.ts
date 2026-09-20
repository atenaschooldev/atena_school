import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { ResendWebhookController } from './resend-webhook.controller';
import { NotificationsService } from './notifications.service';
import { NotificationTriggersService } from './notification-triggers.service';
import { NotificationTriggerEngineService } from './notification-trigger-engine.service';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, MailModule],
  controllers: [NotificationsController, ResendWebhookController],
  providers: [
    NotificationsService,
    NotificationTriggersService,
    NotificationTriggerEngineService,
  ],
  exports: [
    NotificationsService,
    NotificationTriggersService,
    NotificationTriggerEngineService,
  ],
})
export class NotificationsModule {}

