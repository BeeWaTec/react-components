import classNames from "classnames";
import React from "react";

interface FormGroupIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
    status?: 'ok' | 'warning' | 'error' | 'disabled' | 'loading' | 'neutral' | 'custom',
    customColor?: string,
}
function FormGroupIndicator (props: FormGroupIndicatorProps) {
    const { status, customColor,...restProps } = props;

    return (
        <div
            className={classNames(
                `w-[0.5rem] max-w-[0.5rem] min-w-[0.5rem] flex items-center justify-center form-group-indicator`,
                {
                    'bg-green-600': status === 'ok',
                    'bg-yellow-600': status === 'warning',
                    'bg-red-600': status === 'error',
                    'bg-gray-600': status === 'disabled',
                    'bg-blue-600 animate-pulse': status === 'loading',
                    'bg-white': status === 'neutral',
                },
                restProps.className,
            )}
            style={{
                color: status === 'custom' ? customColor : undefined,
            }}
            {...restProps}
        />
    );
}

export default FormGroupIndicator;