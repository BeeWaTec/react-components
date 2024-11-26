import * as FaIcons from "react-icons/fa";
import classNames from "classnames";
import React from "react";

interface FormGroupPrefixTextProps extends React.HTMLAttributes<HTMLDivElement> {
    text?: string;
    icon?: string;
}
function FormGroupPrefixText (props: FormGroupPrefixTextProps) {
    const { className, icon, ...restProps } = props;

    const IComponent = FaIcons[icon as keyof typeof FaIcons]

    return (
        <div
            className={classNames(
                `form-group-prefix-text w-[11rem] min-w-[11rem] max-w-[11rem] flex items-center justify-center text-gray-800`,
                className
            )}
            {...restProps}
        >
            {props.icon && (
                <IComponent
                    className='px-2 text-lg text-gray-800'
                />
            )}
            {props.text && (
                <span className='text-sm font-semibold text-left text-gray-800 w-full px-2'>{props.text}</span>
            )}
            {props.children}
        </div>
    );
}

export default FormGroupPrefixText;