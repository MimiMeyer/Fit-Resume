-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "headline" TEXT,
    "summary" TEXT,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "period" TEXT,
    "impact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileSkill" (
    "profileId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "ProfileSkill_pkey" PRIMARY KEY ("profileId","skillId")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT,
    "field" TEXT,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "issuedYear" INTEGER,
    "credentialUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "stack" TEXT,
    "source" TEXT,
    "matchScore" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ready_to_apply',
    "notes" TEXT,
    "tailored" TEXT,
    "profileId" INTEGER NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileSkill" ADD CONSTRAINT "ProfileSkill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileSkill" ADD CONSTRAINT "ProfileSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
