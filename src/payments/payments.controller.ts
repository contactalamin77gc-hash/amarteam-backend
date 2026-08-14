import {
  Controller, Get, Post, Body, Query, Param, ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { RecordPaymentDto, RecordPayoutDto, RecordDirectDto } from './dto/payment.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role, TxRefType } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Controller('payments')
@Roles(Role.ADMIN)
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  /** Current commission + advance percentages. */
  @Get('rates')
  getRates() {
    return this.payments.getRates();
  }

  /** What's owed and what's been paid on one booking. */
  @Get('quote/:refType/:refId')
  quote(
    @Param('refType') refType: TxRefType,
    @Param('refId', ParseUUIDPipe) refId: string,
  ) {
    return this.payments.quote(refType, refId);
  }

  /** Full ledger history for one booking. */
  @Get('ledger/:refType/:refId')
  ledger(
    @Param('refType') refType: TxRefType,
    @Param('refId', ParseUUIDPipe) refId: string,
  ) {
    return this.payments.ledger(refType, refId);
  }

  /** Dashboard totals — received, commission earned, held, paid out. */
  @Get('totals')
  totals() {
    return this.payments.totals();
  }

  /** Hirer's money arrived. Admin verifies the TrxID and records it. */
  @Post('record')
  record(@Body() dto: RecordPaymentDto, @CurrentUser() user: User) {
    return this.payments.recordPayment(dto, user.id);
  }

  /** Money sent out to talent. */
  @Post('payout')
  payout(@Body() dto: RecordPayoutDto, @CurrentUser() user: User) {
    return this.payments.recordPayout(dto, user.id);
  }

  /** Hirer paid the talent directly — bookkeeping only. */
  @Post('direct')
  direct(@Body() dto: RecordDirectDto, @CurrentUser() user: User) {
    return this.payments.recordDirect(dto, user.id);
  }
}