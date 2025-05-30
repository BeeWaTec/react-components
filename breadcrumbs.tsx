import { HomeIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import Spinner from "./spinner";
import { JSX } from "react";

interface Props {
  homeHref?: string | null;
  pages: ({ name: string; href: string; icon?: JSX.Element | null; visible?: boolean } | null)[];
  showLoading?: boolean;
}
export default function Breadcrumbs({ homeHref, pages, showLoading = false }: Props = { homeHref: null, pages: [] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex space-x-4 rounded-md bg-white px-6 shadow">
        <li className="flex">
          <div className="flex items-center justify-center h-full text-gray-400">
            {!homeHref || homeHref === null || /^https?:\/\/((?:[\w\d-]+\.)+[\w\d]{2,}).*$/.test(homeHref) ? (
              <a
                href={homeHref ? homeHref : undefined}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                aria-current={window.location.pathname === homeHref ? "page" : undefined}
                style={{ height: "24px" }}
              >
                <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="sr-only">Home</span>
              </a>
            ) : (
              <Link
                href={homeHref}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                aria-current={
                  typeof window !== "undefined" && window.location.pathname === homeHref ? "page" : undefined
                }
              >
                <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="sr-only">Home</span>
              </Link>
            )}
          </div>
        </li>
        {showLoading && (
          <li className="flex">
            <svg
              className="h-full w-6 flex-shrink-0 text-gray-200"
              viewBox="0 0 24 44"
              preserveAspectRatio="none"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
            </svg>
            <Spinner className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 w-7 h-7 self-center" />
          </li>
        )}
        {pages
          .filter((page) => page !== null && page.visible !== false)
          .map((page) => (
            <li key={page!.name} className="flex">
              <div className="flex items-center">
                <svg
                  className="h-full w-6 flex-shrink-0 text-gray-200"
                  viewBox="0 0 24 44"
                  preserveAspectRatio="none"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
                </svg>
                {/^https?:\/\/((?:[\w\d-]+\.)+[\w\d]{2,}).*$/.test(page!.href) ? (
                  <a
                    href={page!.href}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    aria-current={window.location.pathname === page!.href ? "page" : undefined}
                  >
                    {page!.name}
                  </a>
                ) : (
                  <Link
                    href={page!.href}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    aria-current={window.location.pathname === page!.href ? "page" : undefined}
                  >
                    {page!.name}
                  </Link>
                )}
              </div>
            </li>
          ))}
      </ol>
    </nav>
  );
}
