import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentClaims1787400000000 implements MigrationInterface {
  name = 'PaymentClaims1787400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "payment_claims_status_enum" AS ENUM ('pending','approved','rejected');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_claims" (
        "id"            uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId"        uuid NOT NULL,
        "refs"          jsonb NOT NULL DEFAULT '[]',
        "totalAmount"   integer NOT NULL,
        "method"        "transactions_method_enum" NOT NULL,
        "externalRef"   character varying(120) NOT NULL,
        "senderNumber"  character varying(20),
        "status"        "payment_claims_status_enum" NOT NULL DEFAULT 'pending',
        "note"          text,
        "adminNote"     text,
        "reviewedById"  uuid,
        "reviewedAt"    TIMESTAMP,
        "createdAt"     TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_claims" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_claims_status" ON "payment_claims" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_claims_user" ON "payment_claims" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_claims"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_claims_status_enum"`);
  }
}