-- AlterTable
ALTER TABLE "users" ADD COLUMN "activeOrgId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_activeOrgId_fkey" FOREIGN KEY ("activeOrgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
