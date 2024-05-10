/*
  Warnings:

  - You are about to drop the `Environment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Environment";

-- CreateTable
CREATE TABLE "environment" (
    "id" SERIAL NOT NULL,
    "environment_name" VARCHAR(255) NOT NULL,

    CONSTRAINT "environment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_information" (
    "id" SERIAL NOT NULL,
    "environment_id" INTEGER NOT NULL,
    "general_name" VARCHAR(255),
    "general_context" TEXT,
    "general_common_client_url" VARCHAR(255),
    "general_block_installations" BOOLEAN,
    "general_cause" BOOLEAN,
    "general_encryption_type" VARCHAR(100),
    "general_communication_type" VARCHAR(100),

    CONSTRAINT "environment_information_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "environment_information" ADD CONSTRAINT "environment_information_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
