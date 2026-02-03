import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransactions1769807052419 implements MigrationInterface {
    name = 'CreateTransactions1769807052419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('DEPOSIT', 'WITHDRAW')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."transactions_type_enum" NOT NULL, "amount" numeric(12,2) NOT NULL, "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'COMPLETED', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "ewalletId" uuid, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_32e04ac2e12dced5d127842c9bd" FOREIGN KEY ("ewalletId") REFERENCES "ewallet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_32e04ac2e12dced5d127842c9bd"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    }

}
