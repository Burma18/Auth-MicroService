/*
  Warnings:

  - The primary key for the `Memberships` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `MembershipUserSubscription` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,organizationId]` on the table `Memberships` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `Organizations` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `membershipId` to the `userSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MembershipUserSubscription" DROP CONSTRAINT "MembershipUserSubscription_membershipUserId_membershipOrgI_fkey";

-- DropForeignKey
ALTER TABLE "MembershipUserSubscription" DROP CONSTRAINT "MembershipUserSubscription_userSubscriptionId_fkey";

-- DropIndex
DROP INDEX "userSubscription_userId_key";

-- AlterTable
ALTER TABLE "Memberships" DROP CONSTRAINT "Memberships_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Memberships_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Organizations" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "userSubscription" ADD COLUMN     "membershipId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "MembershipUserSubscription";

-- CreateIndex
CREATE UNIQUE INDEX "Memberships_userId_organizationId_key" ON "Memberships"("userId", "organizationId");

-- AddForeignKey
ALTER TABLE "userSubscription" ADD CONSTRAINT "userSubscription_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Memberships"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
