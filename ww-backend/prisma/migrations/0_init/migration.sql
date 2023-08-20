-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "accountId" VARCHAR NOT NULL,
    "mask" VARCHAR NOT NULL,
    "name" VARCHAR,
    "type" VARCHAR NOT NULL,
    "subtype" VARCHAR NOT NULL,
    "linkId" INTEGER,

    CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_snapshot" (
    "id" SERIAL NOT NULL,
    "balance" DECIMAL(6,2) NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "accountId" INTEGER,

    CONSTRAINT "PK_3296654a614882b571b225c84e3" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link" (
    "id" SERIAL NOT NULL,
    "orgName" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "accessToken" VARCHAR NOT NULL,
    "transactionCursor" VARCHAR,
    "userId" INTEGER,

    CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owned_security" (
    "id" SERIAL NOT NULL,
    "symbol" VARCHAR NOT NULL,
    "quantity" INTEGER NOT NULL,
    "boughtAt" INTEGER NOT NULL,
    "boughtAtDate" TIMESTAMP(6) NOT NULL,
    "accountId" INTEGER,

    CONSTRAINT "PK_a2e69fbd979c55f4b498ac2f7c4" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "firstName" VARCHAR,
    "lastName" VARCHAR,

    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ww_transaction" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "transactionId" VARCHAR NOT NULL,
    "amount" DECIMAL(5,2) NOT NULL,
    "currencyCode" VARCHAR,
    "detailedCategory" VARCHAR NOT NULL,
    "primaryCategory" VARCHAR NOT NULL,
    "name" VARCHAR,
    "merchantName" VARCHAR,
    "paymentChannel" VARCHAR NOT NULL,
    "datetime" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "PK_5a5232f1b108d9c3e6ca0829aa2" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IDX_b1a9fdd281787a66a213f5b725" ON "account"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_78a916df40e02a9deb1c4b75edb" ON "user"("username");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "FK_0fb42c0c0195d48963b006de6ff" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "account_snapshot" ADD CONSTRAINT "FK_b460e5fd11eab0ee0fbd3b23d83" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "link" ADD CONSTRAINT "FK_14a562b14bb83fc8ba73d30d3e0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "owned_security" ADD CONSTRAINT "FK_ac29400a64f1d8c5c85e0a791c4" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ww_transaction" ADD CONSTRAINT "FK_a1d87d90f4104cd0d1d1754a0b7" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

