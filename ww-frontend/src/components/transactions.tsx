import React from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Transaction } from "@/app/page";

const initialTransactions: Transaction[] = [];

export default function Transactions({ transactions = initialTransactions }) {
  return (
    <ScrollArea.Root className="w-auto h-[300px] rounded overflow-hidden bg-white mt-2">
      <ScrollArea.Viewport className="w-full h-full rounded">
        <div className="px-5">
          {transactions.map((transaction) => (
            <div
              className="text-mauve12 text-[13px] leading-[18px] mt-2.5 pt-2.5 bg-slate-400 rounded-md pb-2.5 text-center grid grid-cols-5"
              key={transaction.transactionId}>
              <p className="col-span-1 col-start-1 ">{transaction.merchantName}</p>
              <p className={`col-span-1 col-start-5 pr-5 text-right ${transaction.amount < 0 ? "text-green-700": "text-red-700"}`}>{transaction.amount < 0 ? transaction.amount * -1 : transaction.amount}</p>
            </div>
          ))}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="flex select-none touch-none p-0.5 bg-white transition-colors duration-[160ms] ease-out hover:bg-gray data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
        orientation="vertical">
        <ScrollArea.Thumb className="flex-1 bg-gray-700 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner className="bg-blackA8" />
    </ScrollArea.Root>
  );
}
