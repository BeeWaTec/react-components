import classNames from "classnames";
import React from "react";

interface FormGroupPrefixTextProps extends React.HTMLAttributes<HTMLDivElement> {
    text?: string;
    icon?: () => JSX.Element;
}
function FormGroupPrefixText (props: FormGroupPrefixTextProps) {
    const { className, ...restProps } = props;

    return (
        <div
            className={classNames(
                `form-group-prefix-text w-[11rem] min-w-[11rem] max-w-[11rem] flex items-center justify-center text-gray-800`,
                className
            )}
            {...restProps}
        >
            {props.icon && (
                <div
                    className='px-2 text-lg text-gray-800'
                >
                    <props.icon />
                </div>
            )}
            {props.text && (
                <span className='text-sm font-semibold text-left text-gray-800 w-full px-2'>{props.text}</span>
            )}
            {props.children}
        </div>
    );
}

export default FormGroupPrefixText;