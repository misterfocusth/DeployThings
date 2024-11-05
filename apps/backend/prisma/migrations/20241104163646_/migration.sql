/*
  Warnings:

  - You are about to drop the column `imageRegistryUrl` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `serviceConfigurationId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `uri` on the `UserImage` table. All the data in the column will be lost.
  - You are about to drop the `ProjectCost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceConfiguration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceCredential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceEnvironmentVariable` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[repositoryId]` on the table `UserImage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `arn` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clusterId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskDefinitionId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InfrastructureType" AS ENUM ('FARGATE', 'EC2', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "OperatingSystem" AS ENUM ('LINUX_X86_64', 'LINUX_ARM64', 'WINDOWS_SERVER_2019_CORE', 'WINDOWS_SERVER_2019_FULL', 'WINDOWS_SERVER_2022_CORE', 'WINDOWS_SERVER_2022_FULL');

-- CreateEnum
CREATE TYPE "ContainerPortProtocol" AS ENUM ('TCP', 'UDP');

-- CreateEnum
CREATE TYPE "ExposePortProtocol" AS ENUM ('HTTP', 'HTTP2', 'GRPC', 'NONE');

-- DropForeignKey
ALTER TABLE "ProjectCost" DROP CONSTRAINT "ProjectCost_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_serviceConfigurationId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceConfiguration" DROP CONSTRAINT "ServiceConfiguration_computingOptionId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceConfiguration" DROP CONSTRAINT "ServiceConfiguration_storageOptionId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceCredential" DROP CONSTRAINT "ServiceCredential_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceEnvironmentVariable" DROP CONSTRAINT "ServiceEnvironmentVariable_serviceId_fkey";

-- DropIndex
DROP INDEX "Repository_ownerId_key";

-- DropIndex
DROP INDEX "Service_serviceConfigurationId_key";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "imageRegistryUrl",
DROP COLUMN "serviceConfigurationId",
ADD COLUMN     "arn" TEXT NOT NULL,
ADD COLUMN     "clusterId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "providerBase" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "providerWeight" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "taskDefinitionId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserImage" DROP COLUMN "uri";

-- DropTable
DROP TABLE "ProjectCost";

-- DropTable
DROP TABLE "ServiceConfiguration";

-- DropTable
DROP TABLE "ServiceCredential";

-- DropTable
DROP TABLE "ServiceEnvironmentVariable";

-- CreateTable
CREATE TABLE "TaskDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "taskRoleArn" TEXT,
    "executionRoleArn" TEXT,
    "launchType" "InfrastructureType" NOT NULL DEFAULT 'FARGATE',
    "operatingSystem" "OperatingSystem" NOT NULL,
    "containerName" TEXT NOT NULL,
    "containerPort" INTEGER NOT NULL,
    "containerPortProtocol" "ContainerPortProtocol" NOT NULL DEFAULT 'TCP',
    "exposedPort" INTEGER NOT NULL,
    "exposedPortProtocol" "ExposePortProtocol" NOT NULL DEFAULT 'HTTP',
    "userImageId" TEXT NOT NULL,
    "computingOptionId" TEXT NOT NULL,
    "storageOptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskEnvironmentVariable" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "taskDefinitionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskEnvironmentVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskCredential" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "taskDefinitionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cluster" (
    "id" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "infrastructure" "InfrastructureType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskDefinition_id_key" ON "TaskDefinition"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TaskEnvironmentVariable_id_key" ON "TaskEnvironmentVariable"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TaskEnvironmentVariable_taskDefinitionId_key_key" ON "TaskEnvironmentVariable"("taskDefinitionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCredential_id_key" ON "TaskCredential"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCredential_taskDefinitionId_key_key" ON "TaskCredential"("taskDefinitionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Cluster_id_key" ON "Cluster"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Cluster_ownerId_key" ON "Cluster"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserImage_repositoryId_key" ON "UserImage"("repositoryId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_taskDefinitionId_fkey" FOREIGN KEY ("taskDefinitionId") REFERENCES "TaskDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDefinition" ADD CONSTRAINT "TaskDefinition_userImageId_fkey" FOREIGN KEY ("userImageId") REFERENCES "UserImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDefinition" ADD CONSTRAINT "TaskDefinition_computingOptionId_fkey" FOREIGN KEY ("computingOptionId") REFERENCES "ComputingOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDefinition" ADD CONSTRAINT "TaskDefinition_storageOptionId_fkey" FOREIGN KEY ("storageOptionId") REFERENCES "StorageOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDefinition" ADD CONSTRAINT "TaskDefinition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskEnvironmentVariable" ADD CONSTRAINT "TaskEnvironmentVariable_taskDefinitionId_fkey" FOREIGN KEY ("taskDefinitionId") REFERENCES "TaskDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCredential" ADD CONSTRAINT "TaskCredential_taskDefinitionId_fkey" FOREIGN KEY ("taskDefinitionId") REFERENCES "TaskDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cluster" ADD CONSTRAINT "Cluster_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
