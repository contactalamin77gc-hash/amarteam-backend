import { MigrationInterface, QueryRunner } from "typeorm";

export class ForeignPlayers1786166943500 implements MigrationInterface {
    name = 'ForeignPlayers1786166943500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "isForeign" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "players" ADD "nationality" character varying`);
        await queryRunner.query(`ALTER TABLE "players" ADD "currentCountry" character varying`);
        await queryRunner.query(`ALTER TABLE "players" ADD "availableFrom" date`);
        await queryRunner.query(`ALTER TABLE "players" ADD "availableTo" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "availableTo"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "availableFrom"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "currentCountry"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "nationality"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "isForeign"`);
    }

}
