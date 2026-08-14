import { MigrationInterface, QueryRunner } from 'typeorm';

export class Transactions1786300000000 implements MigrationInterface {
  name = 'Transactions1786300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "transactions_kind_enum" AS ENUM
          ('advanceIn','fullIn','commission','payout','directToPlayer','refund');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "transactions_reftype_enum" AS ENUM
          ('teamRequest','booking','cameramanBooking','vehicleBooking','order');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "transactions_method_enum" AS ENUM
          ('bkash','nagad','card','cash','manual');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "transactions_status_enum" AS ENUM
          ('pending','confirmed','held','failed','reversed');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "transactions" (
        "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
        "kind"        "transactions_kind_enum" NOT NULL,
        "refType"     "transactions_reftype_enum" NOT NULL,
        "refId"       uuid NOT NULL,
        "playerId"    uuid,
        "amount"      numeric(12,2) NOT NULL,
        "method"      "transactions_method_enum" NOT NULL DEFAULT 'manual',
        "externalRef" character varying,
        "status"      "transactions_status_enum" NOT NULL DEFAULT 'pending',
        "note"        text,
        "createdById" uuid,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_transactions_ref"
      ON "transactions" ("refType","refId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "transactions"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transactions_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transactions_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transactions_reftype_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transactions_kind_enum"`);
  }
}