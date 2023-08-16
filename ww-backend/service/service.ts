require("dotenv").config()
import { AccountBase, Transaction as PlaidTransaction, TransactionsSyncRequest } from 'plaid';
import { myAppDataSource } from '../config/datasource';
import { Account } from '../models/account';
import { AccountSnapshot } from '../models/account_snapshot';
import { Link } from '../models/link';
import { User } from '../models/user';
import { Equal } from 'typeorm';
import { client } from '../config/plaidClient';
import { WWTransaction } from '../models/ww_transaction';

const accountRepository = myAppDataSource.getRepository(Account)
const accountSnapshotRepository = myAppDataSource.getRepository(AccountSnapshot)
const userRepository = myAppDataSource.getRepository(User)
const linkRepository = myAppDataSource.getRepository(Link)
const transactionRepository = myAppDataSource.getRepository(WWTransaction);

export async function getAuthenticatedUser(claims: any) {

    if (!claims) {
        throw new Error('unauthenticated');
    }

    const user = await userRepository.findOneBy({ id: claims.id })
    if (user == null) {
        throw new Error('unauthenticated');
    }


    return user;
}

export async function getAuthenticatedUserWithLinks(claims: any) {

    if (!claims) {
        throw new Error('unauthenticated');
    }

    const user = await userRepository.findOne({
        where: { 
            id: claims.id 
        },
        relations: {
            links: true
        }
    })
    console.log(user)
    if (user == null) {
        throw new Error('unauthenticated');
    }


    return user;
}

export function createAccountSnapshot(accounts: AccountBase[], link: Link) {
    //TODO: add a try catch and throw error if there is one
    accounts.forEach(async (accountData) => {
        var account = await accountRepository.findOneBy({ accountId: accountData.account_id, link: Equal(link.id) })
        if (account == null) {
            account = new Account()
            account.accountId = accountData.account_id
            account.link = link
            account.mask = accountData.mask || "";
            account.type = accountData.type || "";
            account.subtype = accountData.subtype || "";

            await accountRepository.save(account);
        }

        var accountSnapshot = new AccountSnapshot();
        accountSnapshot.account = account;
        accountSnapshot.balance = accountData.balances.current || 0;
        accountSnapshot.date = new Date();

        await accountSnapshotRepository.save(accountSnapshot);
    });
}

type AccountWithBalance = {
    mask: string,
    balance: number
}

export async function getAccounts(userData: User) {
    let accounts: Account[] = []

    for (const link of userData.links) {
        const linkAccounts = await accountRepository.findBy({ link: Equal(link.id) })
        linkAccounts.forEach((linkedAcc) => {
            accounts.push(linkedAcc)
        })
        console.log("linked Accounts: " + linkAccounts)
    }

    console.log("accounts: " + accounts)

    return accounts

}

export async function getAccountsCurrentBalance(accounts: Account[]) {

    const accountsWithBalance: AccountWithBalance[] = []

    for (const accountData of accounts) {
        const currentBalance = await accountSnapshotRepository.findOne({
            order: {
                date: "DESC"
            },
            where: {
                account: Equal(accountData.id)
            }
        })
        console.log("current balance: " + currentBalance)
        if (currentBalance) {
            accountsWithBalance.push({
                mask: accountData.mask,
                balance: currentBalance.balance
            })
        }
    }
    console.log("balances: " + accountsWithBalance)

    return accountsWithBalance

}

export async function getTransactionSync(link: Link) {

    // Provide a cursor from your database if you've previously
    // received one for the Item. Leave null if this is your
    // first sync call for this Item. The first request will
    // return a cursor.
    let cursor = link.transactionCursor
    let hasMore = true;
    // Iterate through each page of new plaidTransaction updates for item
    while (hasMore) {
        const request: TransactionsSyncRequest = {
            access_token: link.accessToken,
            cursor: cursor,
            options: { include_personal_finance_category: true },
        };
        const response = await client.transactionsSync(request);
        const data = response.data;
        
        data.added.forEach((plaidTransaction) => {
            plaidTransactionToWWTransaction(plaidTransaction);
        })
        data.modified.forEach((plaidTransaction) => {
            plaidTransactionToWWTransaction(plaidTransaction);
        })
        
        data.removed.forEach(async (plaidTransaction) => {
            if(plaidTransaction.transaction_id){
                var wwTransaction = await transactionRepository.findOne({
                    where: {
                        transactionId: Equal(plaidTransaction.transaction_id)
                    }
                })

                if(wwTransaction){
                    await transactionRepository.delete(wwTransaction)
                }
            }
        })

        // Update cursor to the next cursor
        cursor = data.next_cursor;
    }


}

async function plaidTransactionToWWTransaction(plaidTransaction: PlaidTransaction) {
    var wwTransaction = await transactionRepository.findOne({
        where: {
            transactionId: Equal(plaidTransaction.transaction_id)
        }
    })

    if (!wwTransaction) {
        wwTransaction = new WWTransaction()
    }
    console.log(plaidTransaction)
    var wwTransactionAccount = await accountRepository.findOne({
        where: {
            accountId: Equal(plaidTransaction.account_id)
        }
    })
    if(!wwTransactionAccount){
        throw new Error("account not found " + plaidTransaction.account_id)
    }

    wwTransaction.account = wwTransactionAccount;
    wwTransaction.accountId = plaidTransaction.account_id;
    wwTransaction.transactionId = plaidTransaction.transaction_id
    wwTransaction.name = plaidTransaction.name
    wwTransaction.amount = plaidTransaction.amount;
    wwTransaction.merchantName = plaidTransaction.merchant_name || plaidTransaction.name
    wwTransaction.currencyCode = plaidTransaction.iso_currency_code || "N/A"
    wwTransaction.datetime = new Date(plaidTransaction.datetime || 0);
    wwTransaction.paymentChannel = plaidTransaction.payment_channel
    if(plaidTransaction.personal_finance_category){
        wwTransaction.primaryCategory = plaidTransaction.personal_finance_category.primary;
        wwTransaction.detailedCategory = plaidTransaction.personal_finance_category.detailed
    }

    await transactionRepository.save(wwTransaction)
}

export async function getAllTransactionsForUser(user: User): Promise<WWTransaction[]>{
    let transactions:WWTransaction[] = []
    for(var link of user.links){
        const accounts = await accountRepository.find({
            where: {
                link: Equal(link.id)
            },
            relations: {
                transactions: true
            }
        })
        transactions = transactions.concat(accounts.flatMap((account) => {
            console.log(account.transactions)
            return account.transactions
        }))
    }
    

    return transactions;
}
