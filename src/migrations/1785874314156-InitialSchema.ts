import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1785874314156 implements MigrationInterface {
    name = 'InitialSchema1785874314156'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "authorId" uuid NOT NULL, "playerId" uuid NOT NULL, "rating" numeric(2,1) NOT NULL, "text" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."players_playertype_enum" AS ENUM('player', 'coach', 'referee', 'cameraman')`);
        await queryRunner.query(`CREATE TYPE "public"."players_position_enum" AS ENUM('GK', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'LF', 'CF', 'RF', 'ST')`);
        await queryRunner.query(`CREATE TYPE "public"."players_tier_enum" AS ENUM('A', 'B', 'C')`);
        await queryRunner.query(`CREATE TABLE "players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "playerType" "public"."players_playertype_enum" NOT NULL DEFAULT 'player', "isApproved" boolean NOT NULL DEFAULT false, "photo" character varying(500), "photoPublicId" character varying(255), "position" "public"."players_position_enum", "tier" "public"."players_tier_enum" NOT NULL DEFAULT 'A', "clubs" jsonb NOT NULL DEFAULT '[]', "nationalTeams" jsonb NOT NULL DEFAULT '[]', "age" integer NOT NULL, "experience" integer NOT NULL DEFAULT '1', "rating" numeric(2,1) NOT NULL DEFAULT '0', "charges" jsonb NOT NULL DEFAULT '{"friendly":5000,"groupRound":8000,"final":12000,"friendlyDiscount":null,"groupRoundDiscount":null,"finalDiscount":null}', "isAvailable" boolean NOT NULL DEFAULT true, "location" character varying(100), "bio" text, "stats" jsonb NOT NULL DEFAULT '{"goals":0,"assists":0,"matches":0,"cleanSheets":0,"yellowCards":0,"redCards":0}', "availableDates" jsonb NOT NULL DEFAULT '[]', "unavailableDates" jsonb NOT NULL DEFAULT '[]', "videos" jsonb NOT NULL DEFAULT '[]', "tournaments" jsonb NOT NULL DEFAULT '[]', "matchHistory" jsonb NOT NULL DEFAULT '[]', "coachingLicense" character varying(100), "specialization" character varying(100), "tacticsStyle" character varying(200), "refereeLicense" character varying(100), "fifaBadge" boolean NOT NULL DEFAULT false, "matchesOfficiated" integer NOT NULL DEFAULT '0', "district" character varying(100), "upazila" character varying(100), "perMatchRate" integer, "equipment" character varying(200), "portfolioPhotos" jsonb NOT NULL DEFAULT '[]', "portfolioVideos" jsonb NOT NULL DEFAULT '[]', "hasDrone" boolean NOT NULL DEFAULT false, "doesEditing" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_7c11c744c0601ab432cfa6ff7a" UNIQUE ("userId"), CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('pending', 'confirmed', 'cancelled', 'completed')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hirerId" uuid NOT NULL, "playerId" uuid NOT NULL, "matchDate" date NOT NULL, "tournament" character varying(150) NOT NULL, "message" text, "amount" integer NOT NULL, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."team_requests_status_enum" AS ENUM('callingSoon', 'advancePending', 'confirmed', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "team_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hirerId" uuid NOT NULL, "matchDate" date, "tournament" character varying(150), "location" character varying(150), "budget" integer NOT NULL DEFAULT '0', "playersNeeded" integer NOT NULL DEFAULT '11', "message" text, "squad" jsonb NOT NULL DEFAULT '[]', "status" "public"."team_requests_status_enum" NOT NULL DEFAULT 'callingSoon', "adminNote" text, "finalAmount" integer, "advanceAmount" integer, "suggestedPlayerIds" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_11860d906290f929c95868ee7f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'player', 'hirer')`);
        await queryRunner.query(`CREATE TYPE "public"."users_authprovider_enum" AS ENUM('local', 'google', 'apple')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(150) NOT NULL, "password" character varying, "phone" character varying(20), "location" character varying(100), "role" "public"."users_role_enum" NOT NULL DEFAULT 'hirer', "isActive" boolean NOT NULL DEFAULT true, "emailVerified" boolean NOT NULL DEFAULT false, "phoneVerified" boolean NOT NULL DEFAULT false, "authProvider" "public"."users_authprovider_enum" NOT NULL DEFAULT 'local', "googleId" character varying(255), "appleId" character varying(255), "avatar" character varying(500), "failedLoginAttempts" integer NOT NULL DEFAULT '0', "lockedUntil" TIMESTAMP, "lastLoginAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_a000cca60bcf04454e72769949" ON "users" ("phone") `);
        await queryRunner.query(`CREATE INDEX "IDX_f382af58ab36057334fb262efd" ON "users" ("googleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_60cea0d80c39eedaaaf5e21f17" ON "users" ("appleId") `);
        await queryRunner.query(`CREATE TYPE "public"."vehicle_bookings_status_enum" AS ENUM('advancePending', 'confirmed', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "vehicle_bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customerId" uuid NOT NULL, "vehicleId" uuid NOT NULL, "startDate" date NOT NULL, "days" integer NOT NULL, "district" character varying(100) NOT NULL, "upazila" character varying(100), "pickupAddress" character varying(250), "message" text, "estimatedAmount" integer NOT NULL, "finalAmount" integer, "advanceAmount" integer, "status" "public"."vehicle_bookings_status_enum" NOT NULL DEFAULT 'advancePending', "adminNote" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f86cd4bafbe11a7da1f3cfdb5dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_vehicletype_enum" AS ENUM('car', 'microbus', 'minibus', 'bus', 'pickup')`);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "model" character varying(150) NOT NULL, "vehicleType" "public"."vehicles_vehicletype_enum" NOT NULL DEFAULT 'car', "seats" integer NOT NULL, "hasAc" boolean NOT NULL DEFAULT false, "description" text, "photos" jsonb NOT NULL DEFAULT '[]', "basePerDay" integer NOT NULL, "districtCharges" jsonb NOT NULL DEFAULT '[]', "minDays" integer NOT NULL DEFAULT '1', "maxDays" integer, "isAvailable" boolean NOT NULL DEFAULT true, "unavailableDates" jsonb NOT NULL DEFAULT '[]', "baseDistrict" character varying(100), "registrationNo" character varying(20), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "nameBn" character varying(100), "icon" character varying(10), "image" character varying(500), "imagePublicId" character varying(255), "description" text, "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "nameBn" character varying(200), "description" text, "categoryId" uuid, "photos" jsonb NOT NULL DEFAULT '[]', "price" integer NOT NULL, "oldPrice" integer, "stock" integer NOT NULL DEFAULT '0', "brand" character varying(100), "variants" jsonb NOT NULL DEFAULT '[]', "dhakaDeliveryCharge" integer NOT NULL DEFAULT '60', "outsideDeliveryCharge" integer NOT NULL DEFAULT '120', "isFeatured" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "soldCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'onTheWay', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderNo" character varying(20) NOT NULL, "customerId" uuid NOT NULL, "items" jsonb NOT NULL DEFAULT '[]', "subtotal" integer NOT NULL, "deliveryCharge" integer NOT NULL, "total" integer NOT NULL, "recipientName" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "district" character varying(100) NOT NULL, "upazila" character varying(100), "address" text NOT NULL, "note" text, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "paymentMethod" character varying(50) NOT NULL DEFAULT 'cashOnDelivery', "isPaid" boolean NOT NULL DEFAULT false, "transactionId" character varying(100), "adminNote" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9e116d4adfd60229dc662a81b03" UNIQUE ("orderNo"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "site_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(100) NOT NULL, "value" text, "publicId" character varying(255), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e71167433328a5afb90dda43da0" UNIQUE ("key"), CONSTRAINT "PK_e4290e8371a166d7e066d131f6e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."otps_purpose_enum" AS ENUM('emailVerify', 'phoneVerify', 'passwordReset', 'login')`);
        await queryRunner.query(`CREATE TYPE "public"."otps_channel_enum" AS ENUM('email', 'sms')`);
        await queryRunner.query(`CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifier" character varying(150) NOT NULL, "code" character varying(10) NOT NULL, "purpose" "public"."otps_purpose_enum" NOT NULL, "channel" "public"."otps_channel_enum" NOT NULL, "userId" character varying, "expiresAt" TIMESTAMP NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, "attempts" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f015ce81084e256f3cdda78088" ON "otps" ("identifier") `);
        await queryRunner.query(`CREATE TYPE "public"."cameraman_bookings_status_enum" AS ENUM('advancePending', 'confirmed', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "cameraman_bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customerId" uuid NOT NULL, "cameramanId" uuid NOT NULL, "matchDate" date NOT NULL, "tournament" character varying(150), "district" character varying(100) NOT NULL, "upazila" character varying(100), "venue" character varying(250), "startTime" character varying(20), "durationHours" integer NOT NULL DEFAULT '2', "message" text, "quotedRate" integer NOT NULL, "finalAmount" integer, "advanceAmount" integer, "status" "public"."cameraman_bookings_status_enum" NOT NULL DEFAULT 'advancePending', "adminNote" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_43836cce733d1a2622f4e029c15" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_48770372f891b9998360e4434f3" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_54e5131492e531dae5df0932fba" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "players" ADD CONSTRAINT "FK_7c11c744c0601ab432cfa6ff7ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_9176542d266a3a89a3fd3b78f4e" FOREIGN KEY ("hirerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_51cff11be4b4695da672218e174" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_requests" ADD CONSTRAINT "FK_349a6bd6c4fa096a14217b2b907" FOREIGN KEY ("hirerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "FK_8e77efe65a530e894dbc2e3e340" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "FK_c52bbf66546e4fd1a979b5b9a2f" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cameraman_bookings" ADD CONSTRAINT "FK_745b48506bacd01dc3c27f5dfe1" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cameraman_bookings" ADD CONSTRAINT "FK_6a0ce97472daf4a0c56b0abb7d0" FOREIGN KEY ("cameramanId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cameraman_bookings" DROP CONSTRAINT "FK_6a0ce97472daf4a0c56b0abb7d0"`);
        await queryRunner.query(`ALTER TABLE "cameraman_bookings" DROP CONSTRAINT "FK_745b48506bacd01dc3c27f5dfe1"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "vehicle_bookings" DROP CONSTRAINT "FK_c52bbf66546e4fd1a979b5b9a2f"`);
        await queryRunner.query(`ALTER TABLE "vehicle_bookings" DROP CONSTRAINT "FK_8e77efe65a530e894dbc2e3e340"`);
        await queryRunner.query(`ALTER TABLE "team_requests" DROP CONSTRAINT "FK_349a6bd6c4fa096a14217b2b907"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_51cff11be4b4695da672218e174"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_9176542d266a3a89a3fd3b78f4e"`);
        await queryRunner.query(`ALTER TABLE "players" DROP CONSTRAINT "FK_7c11c744c0601ab432cfa6ff7ad"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_54e5131492e531dae5df0932fba"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_48770372f891b9998360e4434f3"`);
        await queryRunner.query(`DROP TABLE "cameraman_bookings"`);
        await queryRunner.query(`DROP TYPE "public"."cameraman_bookings_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f015ce81084e256f3cdda78088"`);
        await queryRunner.query(`DROP TABLE "otps"`);
        await queryRunner.query(`DROP TYPE "public"."otps_channel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."otps_purpose_enum"`);
        await queryRunner.query(`DROP TABLE "site_settings"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_vehicletype_enum"`);
        await queryRunner.query(`DROP TABLE "vehicle_bookings"`);
        await queryRunner.query(`DROP TYPE "public"."vehicle_bookings_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60cea0d80c39eedaaaf5e21f17"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f382af58ab36057334fb262efd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a000cca60bcf04454e72769949"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_authprovider_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "team_requests"`);
        await queryRunner.query(`DROP TYPE "public"."team_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
        await queryRunner.query(`DROP TABLE "players"`);
        await queryRunner.query(`DROP TYPE "public"."players_tier_enum"`);
        await queryRunner.query(`DROP TYPE "public"."players_position_enum"`);
        await queryRunner.query(`DROP TYPE "public"."players_playertype_enum"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
    }

}
