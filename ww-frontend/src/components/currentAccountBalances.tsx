'use client'
import { Account } from '@/app/page';
import * as ScrollArea from '@radix-ui/react-scroll-area';

const initialAccounts: Account[] = []
export default function CurrentAccountBalances({accounts = initialAccounts, networth = 0 }) {



    return (
        <ScrollArea.Root className="h-[300px] rounded overflow-hidden">
            <ScrollArea.Viewport className="w-full h-full rounded">
                <div className="py-[15px] px-5">
                    <div className="text-violet11 text-[15px] leading-[18px] text-center font-medium">Networth: {networth}</div>
                    {accounts.map((account) => (
                        <div
                            className="text-mauve12 text-[13px] leading-[18px] mt-2.5 pt-2.5 border-t border-t-mauve6"
                            key={account.mask}
                        >
                            {account.mask + ": $" + account.balance}
                        </div>
                    ))}
                </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
                className="flex select-none touch-none p-0.5 bg-white transition-colors duration-[160ms] ease-out hover:bg-gray data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                orientation="vertical"
            >
                <ScrollArea.Thumb className="flex-1 bg-gray-700 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner className="bg-gray-400" />
        </ScrollArea.Root>
    )
}