import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentColumns1786800000000 implements MigrationInterface {
  name = 'PaymentColumns1786800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "payment_status_enum" AS ENUM
          ('unpaid','advancePaid','fullyPaid','refunded');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    const tables = ['bookings', 'team_requests', 'cameraman_bookings', 'vehicle_bookings'];

    for (const t of tables) {
      // Commission rate is snapshotted per booking so changing the
      // global setting never rewrites historical terms.
      await queryRunner.query(`ALTER TABLE "${t}" ADD COLUMN IF NOT EXISTS "commissionRate" integer`);
      await queryRunner.query(`ALTER TABLE "${t}" ADD COLUMN IF NOT EXISTS "commissionAmount" integer`);
      // Denormalised running totals; kept in step with the ledger inside one DB transaction.
      await queryRunner.query(`ALTER TABLE "${t}" ADD COLUMN IF NOT EXISTS "amountPaid" integer NOT NULL DEFAULT 0`);
      await queryRunner.query(`ALTER TABLE "${t}" ADD COLUMN IF NOT EXISTS "payoutPaid" integer NOT NULL DEFAULT 0`);
      await queryRunner.query(`ALTER TABLE "${t}" ADD COLUMN IF NOT EXISTS "paymentStatus" "payment_status_enum" NOT NULL DEFAULT 'unpaid'`);
    }

    // bookings had only `amount` — bring it in line with the other three
    await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "finalAmount" integer`);
    await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "advanceAmount" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = ['bookings', 'team_requests', 'cameraman_bookings', 'vehicle_bookings'];
    const cols = ['commissionRate', 'commissionAmount', 'amountPaid', 'payoutPaid', 'paymentStatus'];

    for (const t of tables) {
      for (const c of cols) {
        await queryRunner.query(`ALTER TABLE "${t}" DROP COLUMN IF EXISTS "${c}"`);
      }
    }
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "finalAmount"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "advanceAmount"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status_enum"`);
  }
}