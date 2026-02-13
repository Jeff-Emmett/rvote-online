-- AlterTable
ALTER TABLE "User" ADD COLUMN "did" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_did_key" ON "User"("did");
