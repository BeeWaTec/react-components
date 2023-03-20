import classNames from 'classnames'
import React from 'react'

type DividerWithTitleType = {
    className?: string,
    title: string,
    position?: 'left' | 'center' | 'right',
}
export default function DividerWithTitle({ title, className, position = 'center' }: DividerWithTitleType): React.ReactElement {
    return (
        <div className={`relative py-6 ${className}`}>
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
            </div>
            <div
                className={classNames(
                    'absolute inset-0 flex items-center text-center',
                    position === 'left' ? 'justify-start' : position === 'right' ? 'justify-end' : 'justify-center'
                )}
            >
                <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900">{title}</span>
            </div>
        </div>
    )
}