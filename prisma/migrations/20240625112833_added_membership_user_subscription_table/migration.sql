/*
  Warnings:

  - You are about to drop the column `organizationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Exercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lecture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Week` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `userSubscription` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `QuizUser` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Ai" DROP CONSTRAINT "Ai_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "AiPrompt" DROP CONSTRAINT "AiPrompt_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "AiRequest" DROP CONSTRAINT "AiRequest_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseProgress" DROP CONSTRAINT "CourseProgress_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Environment" DROP CONSTRAINT "Environment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseReview" DROP CONSTRAINT "ExerciseReview_courseId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseReview" DROP CONSTRAINT "ExerciseReview_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseSolution" DROP CONSTRAINT "fk_exercisesolution_exercise";

-- DropForeignKey
ALTER TABLE "Language" DROP CONSTRAINT "Language_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_weekId_fkey";

-- DropForeignKey
ALTER TABLE "LectureProgress" DROP CONSTRAINT "LectureProgress_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "Notes" DROP CONSTRAINT "Notes_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "Notes" DROP CONSTRAINT "fk_notes_course";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "VideoProgress" DROP CONSTRAINT "VideoProgress_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "Week" DROP CONSTRAINT "Week_courseId_fkey";

-- DropForeignKey
ALTER TABLE "WeekProgress" DROP CONSTRAINT "WeekProgress_weekId_fkey";

-- DropForeignKey
ALTER TABLE "userSubscription" DROP CONSTRAINT "userSubscription_courseId_fkey";

-- AlterTable
ALTER TABLE "QuizUser" ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "organizationId";

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "Exercise";

-- DropTable
DROP TABLE "Lecture";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "Week";

-- CreateTable
CREATE TABLE "MembershipUserSubscription" (
    "membershipUserId" INTEGER NOT NULL,
    "membershipOrgId" INTEGER NOT NULL,
    "userSubscriptionId" INTEGER NOT NULL,

    CONSTRAINT "MembershipUserSubscription_pkey" PRIMARY KEY ("membershipUserId","membershipOrgId","userSubscriptionId")
);

-- CreateTable
CREATE TABLE "CourseFork" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "isPublished" BOOLEAN DEFAULT false,
    "cover" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT,
    "organizationId" INTEGER,
    "masterCourseId" INTEGER DEFAULT -1,

    CONSTRAINT "CourseFork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMaster" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "cover" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseFork" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "level" "ExerciseLevel",
    "description" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "isPublished" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "extras" JSONB,
    "testCases" JSONB,
    "code" JSONB,
    "lectureId" INTEGER,
    "slug" TEXT,
    "mandatory" BOOLEAN DEFAULT false,
    "languageId" INTEGER,
    "order" INTEGER,
    "countDown" INTEGER,
    "organizationId" INTEGER,
    "masterExerciseId" INTEGER DEFAULT -1,

    CONSTRAINT "ExerciseFork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseMaster" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "level" "ExerciseLevel" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "extras" JSONB[],
    "testCases" JSONB[],
    "code" JSONB NOT NULL,
    "lectureId" INTEGER NOT NULL,
    "slug" TEXT,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "languageId" INTEGER[] DEFAULT ARRAY[1]::INTEGER[],
    "order" INTEGER,
    "countDown" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureFork" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "organizationId" INTEGER,
    "video" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "isPublished" BOOLEAN DEFAULT false,
    "isFree" BOOLEAN DEFAULT true,
    "isActive" BOOLEAN DEFAULT true,
    "order" INTEGER,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "cover" TEXT,
    "weekId" INTEGER,
    "slug" TEXT,
    "languageId" INTEGER,
    "videoMetaData" JSON,
    "personalEnvironment" BOOLEAN DEFAULT false,
    "type" "LectureTypes",
    "masterLectureId" INTEGER DEFAULT -1,

    CONSTRAINT "LectureFork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureMaster" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "video" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cover" TEXT,
    "weekId" INTEGER NOT NULL,
    "slug" TEXT,
    "languageId" INTEGER[],
    "videoMetaData" JSONB,
    "personalEnvironment" BOOLEAN DEFAULT false,
    "type" "LectureTypes" NOT NULL DEFAULT 'TECH_LECTURE',

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memberships" (
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" DATE DEFAULT CURRENT_DATE,
    "updatedAt" DATE DEFAULT CURRENT_DATE,
    "isActive" BOOLEAN DEFAULT true,

    CONSTRAINT "Memberships_pkey" PRIMARY KEY ("userId","organizationId")
);

-- CreateTable
CREATE TABLE "Organizations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "userId" INTEGER,
    "isActive" BOOLEAN DEFAULT true,
    "adminUrl" VARCHAR(255) NOT NULL,
    "studentUrl" VARCHAR(255) NOT NULL,
    "isSignUpEnabled" BOOLEAN DEFAULT true,
    "isPhoneVerificationEnabled" BOOLEAN DEFAULT false,
    "expiry" DATE,
    "createdAt" DATE DEFAULT CURRENT_DATE,
    "updatedAt" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekFork" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "isPublished" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "order" INTEGER,
    "courseId" INTEGER,
    "slug" TEXT,
    "organizationId" INTEGER,
    "masterWeekId" INTEGER DEFAULT -1,

    CONSTRAINT "WeekFork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekMaster" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "slug" TEXT,

    CONSTRAINT "Week_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userSubscription_idx" ON "MembershipUserSubscription"("userSubscriptionId");

-- CreateIndex
CREATE INDEX "membership_idx" ON "MembershipUserSubscription"("membershipUserId", "membershipOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMaster_title_key" ON "CourseMaster"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Organizations_name_key" ON "Organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "userSubscription_userId_key" ON "userSubscription"("userId");

-- AddForeignKey
ALTER TABLE "userSubscription" ADD CONSTRAINT "userSubscription_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CourseMaster"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MembershipUserSubscription" ADD CONSTRAINT "MembershipUserSubscription_membershipUserId_membershipOrgI_fkey" FOREIGN KEY ("membershipUserId", "membershipOrgId") REFERENCES "Memberships"("userId", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipUserSubscription" ADD CONSTRAINT "MembershipUserSubscription_userSubscriptionId_fkey" FOREIGN KEY ("userSubscriptionId") REFERENCES "userSubscription"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CourseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "ExerciseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CourseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "LectureMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseReview" ADD CONSTRAINT "ExerciseReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CourseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseReview" ADD CONSTRAINT "ExerciseReview_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "ExerciseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CourseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekProgress" ADD CONSTRAINT "WeekProgress_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "WeekMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureProgress" ADD CONSTRAINT "LectureProgress_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "LectureMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ai" ADD CONSTRAINT "Ai_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "ExerciseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRequest" ADD CONSTRAINT "AiRequest_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "ExerciseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiPrompt" ADD CONSTRAINT "AiPrompt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "ExerciseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "LectureMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "fk_notes_course" FOREIGN KEY ("courseId") REFERENCES "CourseMaster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CourseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Environment" ADD CONSTRAINT "Environment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CourseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSolution" ADD CONSTRAINT "fk_exercisesolution_exercise" FOREIGN KEY ("exerciseId") REFERENCES "ExerciseMaster"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "LectureMaster"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CourseFork" ADD CONSTRAINT "CourseFork_masterCourseId_fkey" FOREIGN KEY ("masterCourseId") REFERENCES "CourseMaster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CourseFork" ADD CONSTRAINT "CourseFork_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExerciseFork" ADD CONSTRAINT "ExerciseFork_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "LectureFork"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExerciseFork" ADD CONSTRAINT "ExerciseFork_masterExerciseId_fkey" FOREIGN KEY ("masterExerciseId") REFERENCES "ExerciseMaster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExerciseFork" ADD CONSTRAINT "ExerciseFork_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExerciseMaster" ADD CONSTRAINT "Exercise_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "LectureMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureFork" ADD CONSTRAINT "LectureFork_masterLectureId_fkey" FOREIGN KEY ("masterLectureId") REFERENCES "LectureMaster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LectureFork" ADD CONSTRAINT "LectureFork_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LectureFork" ADD CONSTRAINT "LectureFork_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "WeekFork"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LectureMaster" ADD CONSTRAINT "Lecture_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "WeekMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memberships" ADD CONSTRAINT "Memberships_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Memberships" ADD CONSTRAINT "Memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Organizations" ADD CONSTRAINT "organizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WeekFork" ADD CONSTRAINT "WeekFork_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CourseFork"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WeekFork" ADD CONSTRAINT "WeekFork_masterWeekId_fkey" FOREIGN KEY ("masterWeekId") REFERENCES "WeekMaster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WeekFork" ADD CONSTRAINT "WeekFork_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WeekMaster" ADD CONSTRAINT "Week_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CourseMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
