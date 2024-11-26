import * as FaIcons from "react-icons/fa";
import classNames from "classnames";
import React from "react";

interface FormGroupPrefixIconProps extends React.HTMLAttributes<HTMLDivElement> {
    fontAwesomeIconName?: String
}
function FormGroupPrefixIcon (props: FormGroupPrefixIconProps) {
    const { className, fontAwesomeIconName, ...restProps } = props;

    const IComponent = FaIcons[fontAwesomeIconName as keyof typeof FaIcons]

    return (
        <div
            className={classNames(
                `w-10 h-10 flex items-center justify-center text-gray-800`,
                className
            )}
            {...restProps}
        >
            {props.fontAwesomeIconName && (
                <IComponent/>
            )}
            {props.children}
        </div>
    );
}

export default FormGroupPrefixIcon;