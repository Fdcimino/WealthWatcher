"use client";

import CurrentAccountBalances from "@/components/currentAccountBalances";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import LineChartBalances from "@/components/lineChartBalances";
import TransactionToolBar, { FilterAccount } from "@/components/transactionsToolbar";
import Transactions from "@/components/transactions";
import { TransactionFilter } from "@/components/transactionsToolbar";
import { filter } from "d3";

export type Account = {
  //org: string,
  id: number,
  balance: number,
  mask: string,
};
const initialAccounts: Account[] = [];

export type Snapshot = {
  id: number;
  balance: number;
  date: string;
};

export type AccountWithSnapshot = {
  //org: string,
  account: Account;
  snapshots: Snapshot[];
};

const initialAccountsWithSnapshots: AccountWithSnapshot[] = [];

export type Transaction = {
  accountId: string;
  transactionId: string;
  amount: number;
  currencyCode: string;
  detailedCategory: string;
  primaryCategory: string;
  nullable: true;
  name: string;
  merchantName: string;
  paymentChannel: string;
  datetime: string;
};

const initialTransactions: Transaction[] = [];

const initialFilers: TransactionFilter = {
  accounts: [],
  startDate: undefined,
  endDate: undefined
}

export default function Home() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [networth, setNetworth] = useState(0);
  const [accountsWithSnapshots, setAccountsWithSnapshots] = useState(
    initialAccountsWithSnapshots
  );
  const [filters, setFilters] = useState(initialFilers);
  const [transactions, setTransactions] = useState(initialTransactions);
  const auth = useAuth();

  const stocks = [
    { name: "AAPL", price: 148.48 },
    { name: "GOOG", price: 2727.63 },
    { name: "TSLA", price: 709.67 },
    { name: "AMZN", price: 3346.83 },
    { name: "MSFT", price: 305.76 },
  ];

  useEffect(() => {
    const fetchSnapshots = async () => {
      const snapshotsResponse = await fetch(
        "http://localhost:3030/api/accounts/snaphots",
        {
          method: "GET",
          headers: { "content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (snapshotsResponse.status == 200) {
        const snapshots = await snapshotsResponse.json();

        setAccountsWithSnapshots(snapshots);
      }
    };

    const fetchbalances = async () => {
      const balancesResponse = await fetch(
        "http://localhost:3030/api/accounts/balance",
        {
          method: "GET",
          headers: { "content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (balancesResponse.status == 200) {
        const balances = await balancesResponse.json();

        setAccounts(balances);
      }
    };

    const fetchTransactions = async () => {
      console.log("Query String" + JSON.stringify(filters))
      const transactionsResponse = await fetch(
        "http://localhost:3030/api/transactions?" + new URLSearchParams(JSON.stringify(filters)),
        {
          method: "GET",
          headers: { "content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (transactionsResponse.status == 200) {
        const transactions = await transactionsResponse.json();
        console.log("Transactions: " + JSON.stringify(transactions[0]))
        setTransactions(transactions);
      }
    };

    if (auth.isAuthenticated) {
      fetchbalances();
      fetchSnapshots();
      fetchTransactions();
    }
  }, []);

  useEffect(() => {
    let nw = 0;
    const filterAccounts: FilterAccount[] = []
    for (let account of accounts) {
      console.log(typeof nw + " " + typeof account.balance);
      nw = nw + parseFloat(account.balance + "");

      const filterAccount = new FilterAccount(account);

      filterAccounts.push(filterAccount);
      const newFilters = filters;
      newFilters.accounts = filterAccounts;
      setFilters(newFilters)
    }
    setNetworth(nw);
  }, [accounts]);

  return (
    <main className="container grid grid-flow-row grid-cols-2 grid-rows-2 mx-auto xl:grid-cols-6 bg-slate-500 ">
      <div className="w-auto h-auto col-span-4 p-3 m-3 rounded-md bg-slate-300 drop-shadow-md">
        <LineChartBalances accountsWithSnapshots={accountsWithSnapshots} />
      </div>
      <div className="col-span-1 row-span-1 p-3 m-3 ml-0 mr-0 rounded-md bg-slate-300 drop-shadow-md ">
        <CurrentAccountBalances
          accounts={accounts}
          networth={networth}
        />
      </div>
      <div className="col-span-1 row-span-2 p-3 m-3 rounded-md bg-slate-300 drop-shadow-md">
        <ul>
          {stocks.map((stock) => (
            <li key={stock.name}>
              {stock.name}: ${stock.price}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-auto h-auto col-span-4 p-3 m-3 rounded-md bg-slate-300 drop-shadow-md">
        <h5 className="text-center">Transactions</h5>
        <TransactionToolBar filters={filters} updateFilters={setFilters}/>
        <Transactions transactions={transactions} />
      </div>
      <div className="col-span-1 row-span-1 p-3 m-3 ml-0 mr-0 rounded-md bg-slate-300 drop-shadow-md">
        <h5>BUDGET TODO</h5>
      </div>
    </main>
  );
}
