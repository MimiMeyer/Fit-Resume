-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN "profileId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN "expiresAt" TIMESTAMP(6);

-- DropTable
DROP TABLE "ProfileSkill";

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name" ASC);

-- CreateIndex
CREATE INDEX "Job_expiresAt_idx" ON "Job"("expiresAt" ASC);

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
