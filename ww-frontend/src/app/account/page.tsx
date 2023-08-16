"use client"

import PlaidLinkWithOAuth from '@/components/plaidlink'
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useEffect, useState } from 'react';

type Account = {
    name: string,
    mask: string,
    type: string,
    subType: string,
}

const initialAccounts: Account[] = []

export default function Account() {
    const [accounts, setAccounts ] = useState(initialAccounts);
    const auth = useAuth();

    useEffect(() => {

        const fetchbalances = async () => {
            const accountsResponse = await fetch('http://localhost:3030/api/accounts', {
                method: 'GET',
                headers: { 'content-Type': 'application/json' },
                credentials: 'include',
            })

            if (accountsResponse.status == 200) {
                const accounts = await accountsResponse.json()
                setAccounts(accounts)
            }

        }

        if (auth.isAuthenticated) {
            fetchbalances()
        }
    }, []);

    return (
        <main className="grid-flow-col grid-cols-1 container mx-auto bg-slate-500 pb-10">
            <div className='flex items-center justify-center relative'>
                <div className="text-violet11 text-[30px] leading-[18px] font-medium mx-[20%] text-center p-5">Accounts</div>
                <PlaidLinkWithOAuth className="absolute right-64 bg-slate-600 rounded-md m-2 p-2"/>
            </div>
            <ScrollArea.Root className="w-3/5 h-[750px] rounded overflow-hidden shadow-[0_2px_10px] shadow-blackA7 bg-slate-500 mx-[20%]">
                <ScrollArea.Viewport className="w-full h-full rounded">
                    <div className="py-[15px] px-5">
                        
                        {accounts.map((account) => (
                            <div
                                className="text-mauve12 text-[13px] leading-[18px] mt-2.5 pt-2.5 border-t border-t-mauve6"
                                key={account.mask + account.type + account.subType}
                            >   
                                <h6>{account.name}</h6>
                                <p>{account.mask}</p>
                                <p>{account.type}</p>
                                <p>{account.subType}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar
                    className="flex select-none touch-none p-0.5 bg-white transition-colors duration-[160ms] ease-out hover:bg-blackA8 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                    orientation="vertical"
                >
                    <ScrollArea.Thumb className="flex-1 bg-gray-700 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
                <ScrollArea.Corner className="bg-blackA8" />
            </ScrollArea.Root>
        </main>

    )
}