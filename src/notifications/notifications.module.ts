import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { SmsService } from './sms.service';
import { BookingMailService } from './booking-mail.service';

@Global()
@Module({
  providers: [MailService, SmsService, BookingMailService],
  exports: [MailService, SmsService, BookingMailService],
})
export class NotificationsModule {}