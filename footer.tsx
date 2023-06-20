import { faDiscord } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"

interface DefaultFooterProps {
    navigation: {
        main: {
            name: string,
            href: string,
        }[],
        social: {
            name: string,
            href: string,
            icon: any,
        }[],
    }
    copyright?: string
}
export default function DefaultFooter({ navigation, copyright }: DefaultFooterProps) {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
                <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
                    {navigation.main.map((item) => (
                        <div key={item.name} className="px-5 py-2">
                            <Link href={item.href} className="text-base text-gray-500 hover:text-gray-900">
                                {item.name}
                            </Link>
                        </div>
                    ))}
                </nav>
                <div className="mt-8 flex justify-center space-x-6">
                    {navigation.social.map((item) => (
                        <Link key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">{item.name}</span>
                            <FontAwesomeIcon icon={item.icon} height={20} className="text-base text-gray-500 hover:text-gray-900" />
                        </Link>
                    ))}
                </div>
                <p className="mt-8 text-center text-base text-gray-400">{copyright}</p>
            </div>
        </footer>
    )
}