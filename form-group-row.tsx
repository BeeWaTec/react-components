import classNames from "classnames";
import React from "react";
import TextArea from "./text-area";

interface FormGroupRowProps extends React.HTMLAttributes<HTMLDivElement> {
    seperator?: boolean;
    dynamicHeight?: boolean;
}
const FormGroupRow: React.FC<FormGroupRowProps> = React.forwardRef<HTMLDivElement, FormGroupRowProps>((props, ref) => {
    const { seperator = true, dynamicHeight, className, ...restProps } = props;

    // Create children array
    const children = React.Children.toArray(props.children);

    // Detect if content has a dynamic height element (e.g. textarea) and set height accordingly
    const hasDynamicHeight = children.some((child) => {
        if (typeof child === 'object') {
            if ((child as any).type === TextArea) {
                return true;
            }
        }
        return false;
    });


    return (
        <div
            className={classNames(
                'form-group-row flex flex-row justify-stretch items-stretch',
                hasDynamicHeight || dynamicHeight ? 'h-full' : 'h-10',
                className,
            )}
            {...restProps}
        >
            {children.map((child, idx) => {
                if (idx === 0) {
                    return child;
                }
                return (
                    <>
                        {seperator && (
                            <div className='vr'/>
                        )}
                        {child}
                    </>
                );
            })}
        </div>
    );
});

FormGroupRow.displayName = 'FormGroupRow';

export default FormGroupRow;