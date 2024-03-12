import classNames from "classnames";
import React from "react";
import './form-group.css';

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
}
function FormGroup (props: FormGroupProps) {
    const { ...restProps } = props;

    // Create children array
    const children = React.Children.toArray(props.children);

    return (
        <div
            className={classNames(
                'form-group mt-4 mb-4 container mx-auto flex flex-col items-stretch shadow-sm bg-white rounded-md border border-gray-200',
                restProps.className
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

export default FormGroup;