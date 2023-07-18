import { Disclosure, Menu, Transition } from '@headlessui/react'
import { UserIcon } from '@heroicons/react/24/solid'
import classNames from 'classnames'
import Image from "next/legacy/image"
import Link from 'next/link'
import { Fragment } from 'react'
import Spinner from './spinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes } from '@fortawesome/pro-solid-svg-icons'
import { StaticImageData } from 'next/image'
import setLanguage from 'next-translate/setLanguage'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

interface DefaultNavbarType {
    logo?: StaticImageData,
    logoText?: string | StaticImageData,
    navigationLinks?: {
        name: string,
        link: string,
    }[],
    elementsBeforeUser?: Array<JSX.Element>,
    elementsAfterUser?: Array<JSX.Element>,
    user?: {
        name?: string,
        picture?: string | JSX.Element,
        links?: Array<
            {
                name: string,
                href?: string,
                onClick?: () => void,
                seperatorAfter?: boolean,
            }
        >,
        [key: string]: any,
    },
    showUser?: boolean,
    userIsLoading?: boolean,
    lang?: string,
    languages?: {
        name: string,
        locale: string,
    }[],
}
function DefaultNavbar ({ navigationLinks = [], logo, logoText, user, showUser = false, userIsLoading, elementsBeforeUser = [], elementsAfterUser = [], lang, languages }: DefaultNavbarType) {

    function startLogin () {
        if (Capacitor.isNativePlatform()) {
            console.log('Opening in native browser')
            Browser.open({ 
                url: `${process.env.NEXT_PUBLIC_API_URL}/auth/login` ,
                presentationStyle: 'popover',
                windowName: '_blank',
                width: 800,
            })
        } else {
            console.log('Opening in web browser')
            window.location.href = '/api/auth/login'
        }
    }

    return (
        <div
            className={`h-16`}
        >
            <Disclosure as="nav" className="bg-white shadow fixed z-50 top-0 left-0 right-0 h-18">
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
                                                <FontAwesomeIcon icon={faTimes} className="block h-6 w-6" aria-hidden="true" />
                                            ) : (
                                                <FontAwesomeIcon icon={faBars} className="block h-6 w-6" aria-hidden="true" />
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
                                                <Image
                                                    src={logo}
                                                    alt="Logo"
                                                    width={32}
                                                    height={32}
                                                    className='object-contain'
                                                />
                                            </>
                                        }
                                        {logoText && typeof logoText !== 'string' &&
                                            <>
                                                <div
                                                    className={`ml-5`}
                                                >
                                                    <Image
                                                        src={logoText}
                                                        alt="Logo"
                                                        width={200}
                                                        height={32}
                                                        className='object-contain'
                                                    />
                                                </div>
                                            </>
                                        }
                                        {logoText && typeof logoText === 'string' &&
                                            <>
                                                <div
                                                    className={`ml-5 text-xl font-bold text-gray-900 dark:text-white`}
                                                >
                                                    {logoText}
                                                </div>
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
                                    <>
                                        {elementsBeforeUser && elementsBeforeUser.length > 0 &&
                                            elementsBeforeUser.map((element, index) => (
                                                element
                                            ))
                                        }
                                    </>
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
                                                                <>
                                                                    {typeof user.picture === 'string' ?
                                                                        <Image
                                                                            width={32}
                                                                            height={32}
                                                                            className="rounded-full"
                                                                            src={user.picture as string}
                                                                            alt={`Profile picture of ${user.name}`}
                                                                        />
                                                                        :
                                                                        user.picture
                                                                    }
                                                                </>
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
                                    <>
                                        {elementsAfterUser && elementsAfterUser.length > 0 &&
                                            elementsAfterUser.map((element, index) => (
                                                element
                                            ))
                                        }
                                    </>

                                    {/* Language selector */}
                                    {languages && languages.length > 0 &&
                                        <div className="ml-6 flex items-center">
                                            <Menu as="div" className="relative inline-block text-left">
                                                <div>
                                                    <Menu.Button className="flex items-center bg-gray-100 text-gray-400 hover:text-gray-60">
                                                        <span className="sr-only">Open options</span>
                                                        <Image
                                                            src={`/media/flags/${lang}.webp`}
                                                            alt={languages.find(language => language.locale == lang).name}
                                                            width={30}
                                                            height={30}
                                                            className='object-contain'
                                                        />
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
                                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg cursor-pointer">
                                                        <div className="py-1">
                                                            {languages.map((language, index) => (
                                                                <Menu.Item
                                                                    key={index}
                                                                >
                                                                    {({ active }) => (
                                                                        <a
                                                                            className={classNames(
                                                                                lang == language.locale ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                                'block px-4 py-2 text-sm',
                                                                                'flex items-center'
                                                                            )}
                                                                            onClick={async () => await setLanguage(language.locale)}
                                                                        >
                                                                            <Image
                                                                                src={`/media/flags/${language.locale}.webp`}
                                                                                alt={language.locale}
                                                                                width={30}
                                                                                height={30}
                                                                                className='object-contain'
                                                                            />
                                                                            <span className="ml-2">{language.name}</span>
                                                                        </a>
                                                                    )}
                                                                </Menu.Item>
                                                            ))}
                                                        </div>
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        </div>
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
        </div>
    )
}

export default DefaultNavbar;