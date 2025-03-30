import classNames from "classnames";
import React, { JSX } from "react";

interface FormGroupPrefixIconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: () => JSX.Element;
}
function FormGroupPrefixIcon(props: FormGroupPrefixIconProps) {
  const { className, icon, ...restProps } = props;

  return (
    <div className={classNames("w-10 h-10 flex items-center justify-center text-gray-800", className)} {...restProps}>
      {props.icon && <props.icon />}
      {props.children}
    </div>
  );
}

export default FormGroupPrefixIcon;
