-- CreateEnum
CREATE TYPE "Intent" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "intent" "Intent" NOT NULL DEFAULT 'LOW';
