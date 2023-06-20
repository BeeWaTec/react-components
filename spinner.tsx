import React from 'react'

interface SpinnerProps {
    className?: string,
    size?: number
    dark?: boolean
}
export default function Spinner({ size = 6, dark = true, className, ...props }: SpinnerProps): React.ReactElement {
    return (
        <div className={`flex w-full h-full justify-center items-center ${typeof className !== 'undefined' ? className : ''} block`}>
            <div
                className={`rounded-full animate-spin ease-in-out border-l ${dark ? 'border-gray-700' : 'border-gray-200'} ${typeof className !== 'undefined' ? className : ''}`}
                style={{ width: `${size / 10}rem`, height: `${size / 10}rem` }}
                {...props}
            />
        </div>
    )
}