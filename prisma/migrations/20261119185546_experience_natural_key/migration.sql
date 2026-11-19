-- DropIndex
DROP INDEX "Experience_profileId_startedAt_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Experience_profileId_startedAt_company_key" ON "Experience"("profileId", "startedAt", "company");

