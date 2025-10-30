-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value_prop" TEXT[],
    "ideal_use_cases" TEXT[],

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "linkedIn_bio" TEXT NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "role_score" INTEGER NOT NULL DEFAULT 0,
    "industry_score" INTEGER NOT NULL DEFAULT 0,
    "data_completeness_score" INTEGER NOT NULL DEFAULT 0,
    "rule_score" INTEGER NOT NULL,
    "ai_score" INTEGER NOT NULL,
    "reasoning" TEXT NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Score_leadId_offerId_key" ON "Score"("leadId", "offerId");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
