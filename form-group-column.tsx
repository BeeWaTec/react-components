import classNames from "classnames";
import React from "react";
import './form-group.css';

interface FormGroupColumnProps extends React.HTMLAttributes<HTMLDivElement> {
}
function FormGroupColumn (props: FormGroupColumnProps) {
    const { className, ...restProps } = props;

    // Create children array
    const children = React.Children.toArray(props.children);

    return (
        <div
            className={classNames(
                'form-group-column mx-auto flex flex-col items-stretch w-full',
                className
            )}
            {...restProps}
        >
            {children.map((child, idx) => {
                if (idx === 0) {
                    return child;
                }
                return (
                    <>
                        <hr
                            key={`form-group-divider-${idx}`}
                        />
                        {child}
                    </>
                );
            })}
        </div>
    );
}

FormGroupColumn.name = 'FormGroupColumn';

export default FormGroupColumn;