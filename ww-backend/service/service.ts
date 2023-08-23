require("dotenv").config();
import {
  AccountBase,
  Transaction as PlaidTransaction,
  TransactionsSyncRequest,
} from "plaid";
import { Equal } from "typeorm";
import { client } from "../config/plaidClient";
import { myPrismaClient } from "../config/datasource";
import { Prisma, ww_account, ww_link, ww_transaction, ww_user } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { connect } from "http2";

const userWithLinks = Prisma.validator<Prisma.ww_userDefaultArgs>()({
  include: { links: true },
});

type ww_UserWithLinks = Prisma.ww_userGetPayload<typeof userWithLinks>;

const accountWithTransactions = Prisma.validator<Prisma.ww_accountDefaultArgs>()({
    include: { transactions: true },
  });
  
type ww_AccountWithTransactions = Prisma.ww_accountGetPayload<typeof accountWithTransactions>;

export async function getAuthenticatedUser(claims: any) {
  if (!claims) {
    throw new Error("unauthenticated");
  }

  const user = await myPrismaClient.ww_user.findUnique({
    where: {
      id: claims.id,
    },
  });
  if (user == null) {
    throw new Error("unauthenticated");
  }

  return user;
}

export async function getAuthenticatedUserWithLinks(claims: any) {
  if (!claims) {
    throw new Error("unauthenticated");
  }

  const user = await myPrismaClient.ww_user.findUnique({
    where: {
      id: claims.id,
    },
    include: {
      links: true,
    },
  });
  console.log(user);
  if (user == null) {
    throw new Error("unauthenticated");
  }

  return user;
}

export function createAccountSnapshot(accounts: AccountBase[], link: ww_link) {
  accounts.forEach(async (accountData) => {
    var account = await myPrismaClient.ww_account.findFirst({
      where: {
        accountId: accountData.account_id,
        link: link,
      },
    });

    if (account == null) {
      let newAccount: Prisma.ww_accountCreateInput;
      newAccount = {
        accountId: accountData.account_id,
        link: {
          connect: {
            id: link.id,
          },
        },
        mask: accountData.mask || "",
        type: accountData.type || "",
        subtype: accountData.subtype || "",
      };

      account = await myPrismaClient.ww_account.create({ data: newAccount });
    }

    let accountSnapshot: Prisma.ww_account_snapshotCreateInput;
    accountSnapshot = {
      account: {
        connect: {
          id: account.id,
        },
      },
      balance: accountData.balances.current || 0,
      date: new Date(),
    };

    await myPrismaClient.ww_account_snapshot.create({ data: accountSnapshot });
  });
}

type AccountWithBalance = {
  mask: string;
  balance: Decimal;
};

export async function getAccounts(userData: ww_UserWithLinks) {
  let accounts: ww_account[] = [];
  for (const link of userData.links) {
    const linkAccounts = await myPrismaClient.ww_account.findMany({
      where: { linkId: link.id },
    });
    linkAccounts.forEach((linkedAcc) => {
      accounts.push(linkedAcc);
    });
    console.log("linked Accounts: " + linkAccounts);
  }

  console.log("accounts: " + accounts);

  return accounts;
}

export async function getAccountsCurrentBalance(accounts: ww_account[]) {
  const accountsWithBalance: AccountWithBalance[] = [];

  for (const accountData of accounts) {
    const currentBalance = await myPrismaClient.ww_account_snapshot.findFirst({
      orderBy: {
        date: "desc",
      },
      where: {
        accountId: accountData.id,
      },
    });
    console.log("current balance: " + currentBalance);
    if (currentBalance) {
      accountsWithBalance.push({
        mask: accountData.mask,
        balance: currentBalance.balance,
      });
    }
  }
  console.log("balances: " + accountsWithBalance);

  return accountsWithBalance;
}

export async function getTransactionSync(link: ww_link) {
  // Provide a cursor from your database if you've previously
  // received one for the Item. Leave null if this is your
  // first sync call for this Item. The first request will
  // return a cursor.
  let cursor = link.transactionCursor;
  let hasMore = true;
  // Iterate through each page of new plaidTransaction updates for item
  while (hasMore) {
    const request: TransactionsSyncRequest = {
      access_token: link.accessToken,
      cursor: cursor != null ? cursor : undefined,
      options: { include_personal_finance_category: true },
    };
    const response = await client.transactionsSync(request);
    const data = response.data;

    data.added.forEach((plaidTransaction) => {
      plaidTransactionToWWTransaction(plaidTransaction);
    });
    data.modified.forEach((plaidTransaction) => {
      plaidTransactionToWWTransaction(plaidTransaction);
    });

    data.removed.forEach(async (plaidTransaction) => {
      if (plaidTransaction.transaction_id) {
        const wwTransaction = await myPrismaClient.ww_transaction.findUnique({
          where: {
            transactionId: plaidTransaction.transaction_id,
          },
        });

        if (wwTransaction) {
          await myPrismaClient.ww_transaction.delete({
            where: {
              id: wwTransaction.id,
            },
          });
        }
      }
    });

    // Update cursor to the next cursor
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }
}

async function plaidTransactionToWWTransaction(
  plaidTransaction: PlaidTransaction
) {
  var wwTransactionAccount = await myPrismaClient.ww_account.findUnique({
    where: {
      accountId: plaidTransaction.account_id,
    },
  });
  if (!wwTransactionAccount) {
    throw new Error("account not found " + plaidTransaction.account_id);
  }

  const wwTransaction = await myPrismaClient.ww_transaction.findUnique({
    where: {
      transactionId: plaidTransaction.transaction_id,
    },
  });

  console.log(plaidTransaction);

  let updatedTransaction: Prisma.ww_transactionCreateInput;
  updatedTransaction = {
    account: {
      connect: {
        id: wwTransactionAccount.id,
      },
    },
    transactionId: plaidTransaction.transaction_id,
    name: plaidTransaction.name,
    amount: plaidTransaction.amount,
    merchantName: plaidTransaction.merchant_name || plaidTransaction.name,
    currencyCode: plaidTransaction.iso_currency_code || "N/A",
    datetime: new Date(plaidTransaction.datetime || 0),
    paymentChannel: plaidTransaction.payment_channel,
    primaryCategory: null,
    detailedCategory: null,
  };
  if (plaidTransaction.personal_finance_category) {
    updatedTransaction["primaryCategory"] =
      plaidTransaction.personal_finance_category.primary;
    updatedTransaction["detailedCategory"] =
      plaidTransaction.personal_finance_category.detailed;
  }

  await myPrismaClient.ww_transaction.upsert({
    where: { id: wwTransaction ? wwTransaction.id : -1 },
    update: updatedTransaction,
    create: updatedTransaction,
  });
}

export async function getAllTransactionsForUser(
  user: ww_UserWithLinks
): Promise<ww_transaction[]> {
  let transactions: ww_transaction[] = [];
  for (var link of user.links) {
    const accounts = await myPrismaClient.ww_account.findMany({
      where: {
        linkId: link.id,
      },
      include: {
        transactions: true,
      },
    });
    transactions = transactions.concat(
      accounts.flatMap((account) => {
        console.log(account.transactions);
        return account.transactions;
      })
    );
  }

  return transactions;
}
