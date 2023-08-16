import NavAccountMenuItemProps from "@/interfaces/NavAccountMenuItemProps";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { Fragment, useState } from "react";

function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
}

interface NavAccountMenuProps {
    items: NavAccountMenuItemProps[]
    userIcon?: string | undefined
}

export default function NavAccountMenu(props: NavAccountMenuProps) {


    return (
        <Menu as="div" className="relative ml-3">
            <div>
                <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="sr-only">Open user menu</span>
                    {props.userIcon != undefined ?
                        <img
                            className="h-8 w-8 rounded-full"
                            src={props.userIcon}
                            alt=""
                        />
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="gray" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>

                    }
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {props.items.map((item) => (
                        <Menu.Item key={item.text}>
                            {({ active }) => (
                                <Link
                                    href={item.href ? item.href : "#"}
                                    onClick={item.onClick ? item.onClick : () => console.log("FUCK")}
                                    className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                >
                                    {item.text}
                                </Link>
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Items>
            </Transition>
        </Menu>

    )
}