import classNames from 'classnames'
import React from 'react'

type DividerWithTitleType = {
    className?: string,
    title: string,
    position?: 'left' | 'center' | 'right',
    button?: React.ReactNode, // Add the button prop
}

export default function DividerWithTitle({ title, className, position = 'center', button }: DividerWithTitleType): React.ReactElement {
    return (
        <div className={`relative w-full py-6 ${className}`}>
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
            </div>
            <div
                className={classNames(
                    'absolute inset-0 flex items-center',
                    position === 'left' ? 'justify-start' : position === 'right' ? 'justify-end' : 'justify-center'
                )}
            >
                <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900">{title}</span>
                {button && <div className="ml-3">{button}</div>} {/* Conditionally render the button */}
            </div>
        </div>
    )
}
