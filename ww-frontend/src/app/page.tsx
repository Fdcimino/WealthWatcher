'use client'

import CurrentAccountBalances from '@/components/currentAccountBalances';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import LineChartBalances from '@/components/lineChartBalances';
import TransactionToolBar from '@/components/transactionsToolbar';
import Transactions from '@/components/transactions';

export interface Account  {
    //org: string,
    balance: number,
    mask: string,
}
const initialAccounts: Account[] = []

export interface Snapshot  {
    id: number,
    balance: number,
    date: Date,
}

export interface AccountWithSnapshot {
    //org: string,
    account: Account,
    snapshots: Snapshot[],
}

const initialAccountsWithSnapshots: AccountWithSnapshot[] = []

export interface Transaction {
    
    accountId: string
    transactionId: string
    amount: number;
    currencyCode: string
    detailedCategory: string
    primaryCategory: string
    nullable: true,
    name: string;
    merchantName: string;
    paymentChannel: string;
    datetime: Date
}

const initialTransactions: Transaction[] = []

export default function Home() {

    const [accounts, setAccounts] = useState(initialAccounts);
    const [networth, setNetworth] = useState(0);
    const [accountsWithSnapshots, setAccountsWithSnapshots] = useState(initialAccountsWithSnapshots);
    const [transactions, setTransactions] = useState(initialTransactions);
    const auth = useAuth();

    const stocks = [
        { name: 'AAPL', price: 148.48 },
        { name: 'GOOG', price: 2727.63 },
        { name: 'TSLA', price: 709.67 },
        { name: 'AMZN', price: 3346.83 },
        { name: 'MSFT', price: 305.76 },
    ];

    useEffect(() => {
        
        const fetchSnapshots = async () => {
            const snapshotsResponse = await fetch('http://localhost:3030/api/accounts/snaphots', {
                method: 'GET',
                headers: { 'content-Type': 'application/json' },
                credentials: 'include',
            })

            if (snapshotsResponse.status == 200) {
                const snapshots = await snapshotsResponse.json()

                setAccountsWithSnapshots(snapshots)
            }

        }

        const fetchbalances = async () => {
            const balancesResponse = await fetch('http://localhost:3030/api/accounts/balance', {
                method: 'GET',
                headers: { 'content-Type': 'application/json' },
                credentials: 'include',
            })

            if (balancesResponse.status == 200) {
                const balances = await balancesResponse.json()

                setAccounts(balances)
               
            }
        }

        const fetchTransactions = async () =>{
            const transactionsResponse = await fetch('http://localhost:3030/api/transactions', {
                method: 'GET',
                headers: { 'content-Type': 'application/json' },
                credentials: 'include',
            })
            if (transactionsResponse.status == 200) {
                const transactions = await transactionsResponse.json()
                setTransactions(transactions)
            }
        }

        if (auth.isAuthenticated) {
            fetchbalances();
            fetchSnapshots();
            fetchTransactions();
        }
    }, []);

    useEffect(()=>{
        let nw = 0
        for(let account of accounts){
            console.log(typeof(nw) + " " + typeof(account.balance))
            nw = nw + parseFloat(account.balance + "");
        }
        setNetworth(nw)
    }, [accounts])

    return (
        <main className="grid grid-flow-row xl:grid-cols-6 grid-rows-2 container mx-auto bg-slate-500 grid-cols-2 ">
            <div className="col-span-4 m-3 rounded-md bg-slate-300 p-3 drop-shadow-md w-auto h-auto">
                <LineChartBalances accountsWithSnapshots={accountsWithSnapshots}/>
            </div>
            <div className="row-span-1 col-span-1 rounded-md p-3 bg-slate-300 m-3 ml-0 mr-0 drop-shadow-md ">
                <CurrentAccountBalances accounts={accounts} networth={networth} />
            </div>
            <div className="row-span-2 col-span-1 rounded-md p-3 bg-slate-300 m-3 drop-shadow-md">
                <ul>
                    {stocks.map((stock) => (
                        <li key={stock.name}>
                            {stock.name}: ${stock.price}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="col-span-5 rounded-md p-3 bg-slate-300 m-3 mt-0 mr-0 drop-shadow-md">
                <h5 className='text-center'>Transactions</h5>
                <TransactionToolBar/>
                <Transactions transactions={transactions}/>
            </div>
        </main>
    )
}
