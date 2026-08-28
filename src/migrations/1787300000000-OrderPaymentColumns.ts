import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderPaymentColumns1787300000000 implements MigrationInterface {
  name = 'OrderPaymentColumns1787300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // payment_status_enum already exists from the earlier booking migration.
    await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "commissionRate" integer`);
    await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "commissionAmount" integer`);
    await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "amountPaid" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payoutPaid" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "paymentStatus"
      "payment_status_enum" NOT NULL DEFAULT 'unpaid'
    `);

    // Backfill: existing delivered orders were cash on delivery, so they're settled.
    await queryRunner.query(`
      UPDATE "orders" SET "paymentStatus" = 'fullyPaid', "amountPaid" = "total"
      WHERE "status" = 'delivered' AND "isPaid" = true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const c of ['commissionRate', 'commissionAmount', 'amountPaid', 'payoutPaid', 'paymentStatus']) {
      await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "${c}"`);
    }
  }
}