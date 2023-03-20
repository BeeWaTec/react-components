import { Disclosure, Menu, Transition } from '@headlessui/react'
import { UserIcon } from '@heroicons/react/24/solid'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import classNames from 'classnames'
import Image from "next/legacy/image"
import Link from 'next/link'
import { Fragment } from 'react'
import Spinner from './spinner'

interface DefaultNavbarType {
    logo?: string | JSX.Element,
    logoText?: string | JSX.Element,
    navigationLinks?: [
        {
            name: string,
            link: string,
        }?
    ],
    user?: {
        name?: string,
        picture?: string | JSX.Element,
        links?: [
            {
                name: string,
                href?: string,
                onClick?: () => void,
                seperatorAfter?: boolean,
            }?
        ],
        [key: string]: any,
    },
    showUser?: boolean,
    userIsLoading?: boolean,
}
function DefaultNavbar({ navigationLinks = [], logo, logoText, user, showUser = false, userIsLoading }: DefaultNavbarType) {

    return (
        <Disclosure as="nav" className="bg-white shadow">
            {({ open }) => (
                <>
                    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                        <div className="relative flex justify-between h-16">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button */}
                                {navigationLinks.length > 0 &&
                                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XIcon className="block h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                }
                            </div>
                            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                                <Link
                                    className="flex-shrink-0 flex items-center"
                                    href={'/'}
                                >
                                    {logo &&
                                        <>
                                            {typeof logo === 'string' ?
                                                <Image
                                                    src={logo}
                                                    alt={'Logo'}
                                                    objectFit='contain'
                                                    width={32}
                                                    height={32}
                                                />
                                                :
                                                logo
                                            }

                                        </>
                                    }
                                    {logoText &&
                                        <>
                                            {typeof logoText === 'string' ?
                                                <span className="hidden md:block ml-2 text-gray-700 font-bold text-xl">{logoText}</span>
                                                :
                                                logoText
                                            }
                                        </>
                                    }
                                </Link>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                                    {navigationLinks.map((element, index) => (
                                        <a key={index} href={element.link} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                            {element.name}
                                        </a>
                                    ))}
                                </div>

                                {/* Fill in the rest of the navbar */}
                                <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start" />

                                {/* Profile dropdown */}
                                {showUser &&
                                    <>
                                        {userIsLoading &&
                                            <div className="flex ml-3 items-center h-full w-8">
                                                <div className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 w-8 h-8 p-2">
                                                    <Spinner />
                                                </div>
                                            </div>
                                        }
                                        {!userIsLoading && user &&
                                            <Menu as="div" className="relative ml-3">
                                                <div className="flex ml-3 items-center h-full">
                                                    <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                                        <span className="sr-only">Open user menu</span>
                                                        {user.picture &&
                                                            <Image
                                                                width={32}
                                                                height={32}
                                                                className="rounded-full"
                                                                src={user.picture}
                                                                alt={`Profile picture of ${user.name}`}
                                                            />
                                                        }
                                                        {!user.picture &&
                                                            <UserIcon className="h-8 w-8 rounded-full text-gray-300" aria-hidden="true" />
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
                                                        {user.links && user.links.map((element, index) => (
                                                            <Menu.Item
                                                                key={index}
                                                            >
                                                                {({ active }) => (
                                                                    <Link
                                                                        href={element.href}
                                                                        onClick={element.onClick}
                                                                        className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                                                    >
                                                                        {element.name}
                                                                    </Link>
                                                                )}
                                                            </Menu.Item>
                                                        ))}
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        }
                                        {!userIsLoading && !user &&
                                            <div className="flex ml-3 items-center h-full w-8">
                                                <Link
                                                    href="/api/auth/login"
                                                >
                                                    <div className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 w-8 h-8">
                                                        <UserIcon className="h-8 w-8 text-white" />
                                                    </div>
                                                </Link>
                                            </div>
                                        }
                                    </>
                                }
                            </div>
                        </div>
                    </div>

                    {navigationLinks.length > 0 &&
                        <Disclosure.Panel className="sm:hidden">
                            <div className="pt-2 pb-4 space-y-1">
                                {navigationLinks.map((element, index) => (
                                    <Disclosure.Button key={index} as="a" href="#" className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                                        {element.name}
                                    </Disclosure.Button>
                                ))}
                            </div>
                        </Disclosure.Panel>
                    }
                </>
            )}
        </Disclosure>
    )
}

export default DefaultNavbar;