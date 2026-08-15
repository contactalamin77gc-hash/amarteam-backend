import { MigrationInterface, QueryRunner } from 'typeorm';

export class OnTheWayStatus1786900000000 implements MigrationInterface {
  name = 'OnTheWayStatus1786900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Postgres enums are append-only; IF NOT EXISTS keeps this re-runnable.
    await queryRunner.query(`
      ALTER TYPE "team_requests_status_enum"
      ADD VALUE IF NOT EXISTS 'playerOnTheWay' AFTER 'confirmed'
    `);
  }

  public async down(): Promise<void> {
    // Postgres can't drop an enum value without rebuilding the type. Left as a no-op.
  }
}