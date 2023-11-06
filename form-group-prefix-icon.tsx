import { IconName, IconPrefix, IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";

interface FormGroupPrefixIconProps extends React.HTMLAttributes<HTMLDivElement> {
    fontAwesomeIcon?: IconProp | [IconPrefix, IconName];
}
function FormGroupPrefixIcon (props: FormGroupPrefixIconProps) {
    const { fontAwesomeIcon, ...restProps } = props;

    return (
        <div
            className={classNames(
                `w-10 h-10 flex items-center justify-center text-gray-800`,
                restProps.className
            )}
            {...restProps}
        >
            {props.fontAwesomeIcon && (
                <FontAwesomeIcon icon={props.fontAwesomeIcon} />
            )}
            {props.children}
        </div>
    );
}

export default FormGroupPrefixIcon;