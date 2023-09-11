import React, { Dispatch, SetStateAction, useEffect } from "react";
import * as Toolbar from "@radix-ui/react-toolbar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckCircledIcon, DividerHorizontalIcon } from "@radix-ui/react-icons";
import { Account } from "@/app/page";
import { filter } from "d3";

export type TransactionFilter = {
  accounts: FilterAccount[];
  startDate: Date | undefined;
  endDate: Date | undefined;
};

export class FilterAccount {
  account: Account;
  included: boolean;
  
  constructor(account: Account) {
    this.account = account;
    this.included = true;
  }

}

interface TransactionProps {
  filters: TransactionFilter;
  updateFilters: Dispatch<SetStateAction<TransactionFilter>>;
}

export default function TransactionToolBar({
  filters,
  updateFilters,
}: TransactionProps) {

  function onAccountCheck(index: number){
    const newAccountFilters = [...filters.accounts]
    newAccountFilters[index].included = !filters.accounts[index].included;
    updateFilters({...filters, accounts: newAccountFilters})
  }

  return (
    <Toolbar.Root
      className="flex p-[10px] w-full min-w-max rounded-md bg-white "
      aria-label="Formatting options">
      <DropdownMenu.Root>
        <Toolbar.Button asChild>
          <DropdownMenu.Trigger>Accounts</DropdownMenu.Trigger>
        </Toolbar.Button>
        <DropdownMenu.Content className="z-50 p-2 rounded-md bg-slate-400">
          {filters.accounts.map((account, index) => (
            <DropdownMenu.CheckboxItem
              className="text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
              checked={account.included}
              onClick={() => {onAccountCheck(index)}}
              key={index}>
              <DropdownMenu.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
                {account.included ? <CheckCircledIcon /> : <DividerHorizontalIcon />}
              </DropdownMenu.ItemIndicator>
              {account.account.mask}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Toolbar.Root>
  );
}
