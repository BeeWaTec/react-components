import React from 'react'

interface SpinnerProps {
    className?: string,
}
export default function Spinner({ className, ...props }: SpinnerProps): React.ReactElement {
    return (
        <div className={`flex w-full h-full justify-center items-center ${typeof className !== 'undefined' ? className : ''}`}>
            <div className={`w-full h-full border-l-2 rounded-full animate-spin border-gray-400`}></div>
        </div>
    )
}