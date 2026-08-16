import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueExternalRef1787100000000 implements MigrationInterface {
  name = 'UniqueExternalRef1787100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_tx_externalRef_refType"
      ON transactions ("externalRef", "refType")
      WHERE "externalRef" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_tx_externalRef_refType"`);
  }
}
