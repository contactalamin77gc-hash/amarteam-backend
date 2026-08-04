import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1785751468661 implements MigrationInterface {
    name = 'InitialSchema1785751468661'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."otps_purpose_enum" AS ENUM('emailVerify', 'phoneVerify', 'passwordReset', 'login')`);
        await queryRunner.query(`CREATE TYPE "public"."otps_channel_enum" AS ENUM('email', 'sms')`);
        await queryRunner.query(`CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifier" character varying(150) NOT NULL, "code" character varying(10) NOT NULL, "purpose" "public"."otps_purpose_enum" NOT NULL, "channel" "public"."otps_channel_enum" NOT NULL, "userId" character varying, "expiresAt" TIMESTAMP NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, "attempts" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f015ce81084e256f3cdda78088" ON "otps" ("identifier") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phoneVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE TYPE "public"."users_authprovider_enum" AS ENUM('local', 'google', 'apple')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "authProvider" "public"."users_authprovider_enum" NOT NULL DEFAULT 'local'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "googleId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "appleId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "failedLoginAttempts" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lockedUntil" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastLoginAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_a000cca60bcf04454e72769949" ON "users" ("phone") `);
        await queryRunner.query(`CREATE INDEX "IDX_f382af58ab36057334fb262efd" ON "users" ("googleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_60cea0d80c39eedaaaf5e21f17" ON "users" ("appleId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_60cea0d80c39eedaaaf5e21f17"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f382af58ab36057334fb262efd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a000cca60bcf04454e72769949"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLoginAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lockedUntil"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "failedLoginAttempts"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "appleId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "authProvider"`);
        await queryRunner.query(`DROP TYPE "public"."users_authprovider_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneVerified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerified"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f015ce81084e256f3cdda78088"`);
        await queryRunner.query(`DROP TABLE "otps"`);
        await queryRunner.query(`DROP TYPE "public"."otps_channel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."otps_purpose_enum"`);
    }

}
