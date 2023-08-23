-- CreateTable
CREATE TABLE "ww_account" (
    "id" SERIAL NOT NULL,
    "accountId" VARCHAR NOT NULL,
    "mask" VARCHAR NOT NULL,
    "name" VARCHAR,
    "type" VARCHAR NOT NULL,
    "subtype" VARCHAR NOT NULL,
    "linkId" INTEGER NOT NULL,

    CONSTRAINT "ww_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ww_account_snapshot" (
    "id" SERIAL NOT NULL,
    "balance" DECIMAL(6,2) NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "accountId" INTEGER,

    CONSTRAINT "ww_account_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ww_link" (
    "id" SERIAL NOT NULL,
    "orgName" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "accessToken" VARCHAR NOT NULL,
    "transactionCursor" VARCHAR,
    "userId" INTEGER,

    CONSTRAINT "ww_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ww_owned_security" (
    "id" SERIAL NOT NULL,
    "symbol" VARCHAR NOT NULL,
    "quantity" INTEGER NOT NULL,
    "boughtAt" INTEGER NOT NULL,
    "boughtAtDate" TIMESTAMP(6) NOT NULL,
    "accountId" INTEGER,

    CONSTRAINT "ww_owned_security_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ww_user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "firstName" VARCHAR,
    "lastName" VARCHAR,

    CONSTRAINT "ww_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ww_transaction" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "transactionId" VARCHAR NOT NULL,
    "amount" DECIMAL(5,2) NOT NULL,
    "currencyCode" VARCHAR,
    "detailedCategory" VARCHAR,
    "primaryCategory" VARCHAR,
    "name" VARCHAR,
    "merchantName" VARCHAR,
    "paymentChannel" VARCHAR NOT NULL,
    "datetime" TIMESTAMP(6) NOT NULL,
    "userCategories" VARCHAR(200)[],

    CONSTRAINT "ww_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ww_budget" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "ww_budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ww_budget_category" (
    "id" SERIAL NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "limit" DECIMAL(5,2) NOT NULL,
    "categories" VARCHAR(200)[],

    CONSTRAINT "ww_budget_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ww_auto_category" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "merchantName" TEXT,
    "detailedCategory" TEXT,
    "primaryCategory" TEXT,
    "category" TEXT NOT NULL,

    CONSTRAINT "ww_auto_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ww_account_accountId_key" ON "ww_account"("accountId");

-- CreateIndex
CREATE INDEX "ww_account_accountId_idx" ON "ww_account"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "ww_user_username_key" ON "ww_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ww_transaction_transactionId_key" ON "ww_transaction"("transactionId");

-- AddForeignKey
ALTER TABLE "ww_account" ADD CONSTRAINT "ww_account_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "ww_link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ww_account_snapshot" ADD CONSTRAINT "ww_account_snapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ww_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ww_link" ADD CONSTRAINT "ww_link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ww_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ww_owned_security" ADD CONSTRAINT "ww_owned_security_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ww_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ww_transaction" ADD CONSTRAINT "ww_transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ww_account"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ww_budget" ADD CONSTRAINT "ww_budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ww_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ww_budget_category" ADD CONSTRAINT "ww_budget_category_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "ww_budget"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ww_auto_category" ADD CONSTRAINT "ww_auto_category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ww_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
