import { IconName, IconPrefix, IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";

interface FormGroupPrefixTextProps extends React.HTMLAttributes<HTMLDivElement> {
    text?: string;
    icon?: IconProp;
}
function FormGroupPrefixText (props: FormGroupPrefixTextProps) {
    const { ...restProps } = props;

    return (
        <div
            className={classNames(
                `form-group-prefix-text w-[11rem] min-w-[11rem] max-w-[11rem] flex items-center justify-center text-gray-800`,
                restProps.className
            )}
            {...restProps}
        >
            {props.icon && (
                <FontAwesomeIcon
                    icon={props.icon}
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