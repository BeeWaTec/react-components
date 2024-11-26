import classNames from "classnames";
import React, { useEffect } from "react";
import TextArea from "./text-area";
import HelpPopup from "./help-popup";
import axios from "axios";
import { FaQuestion } from "react-icons/fa";

interface FormGroupRowProps extends React.HTMLAttributes<HTMLDivElement> {
    seperator?: boolean;
    dynamicHeight?: boolean;
    help?: { title: string, body?: string, bodyId?: string };
}
const FormGroupRow: React.FC<FormGroupRowProps> = React.forwardRef<HTMLDivElement, FormGroupRowProps>((props, ref) => {
    const { seperator = true, dynamicHeight, className, ...restProps } = props;

    const [helpVisible, setHelpVisible] = React.useState(false);
    const [helpBody, setHelpBody] = React.useState<string | undefined>(props.help?.body);

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

    // Check if help has bodyId instead of body -> Download body from /markdown/:id
    function getHelpBody () {
        if (props.help && props.help.bodyId && !props.help.body) {
            axios.get(`/markdown/${props.help.bodyId}.md`).then((res) => {
                setHelpBody(res.data);
            }).catch((err) => {
                // Retry after 5s
                setTimeout(() => {
                    getHelpBody();
                }, 1000);
            });
        }
    }
    useEffect(() => {
        if (props.help && !props.help.body && props.help.bodyId) {
            getHelpBody();
        }
    }, []);

    return (
        <div
            key='form-group-row'
            className="relative"
        >
            {props.help && (
                <div
                    className='absolute left-0 top-0 w-10 h-10 flex items-center justify-center text-gray-800'
                    style={{ marginLeft: '-2.5rem' }}
                >
                    <FaQuestion
                        className={classNames(
                            "w-4 h-4 border border-gray-200 rounded-full p-1 hover:bg-gray-100",
                            { 'cursor-pointer': typeof helpBody === 'string' },
                            { 'cursor-not-allowed': !helpBody },
                        )}
                        onClick={() => {
                            if (helpBody) {
                                setHelpVisible(true);
                            }
                        }}
                    />
                    {helpBody && (
                        <HelpPopup
                            visible={helpVisible}
                            onHide={() => setHelpVisible(false)}
                            header={props.help.title}
                            body={helpBody}
                        />
                    )}
                </div>
            )}
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
                                <div
                                    key={`form-group-row-divider-${idx}`}
                                    id={`form-group-row-divider-${idx}`}
                                    className='vr'
                                />
                            )}
                            {child}
                        </>
                    );
                })}
            </div>
        </div>
    );
});

FormGroupRow.displayName = 'FormGroupRow';

export default FormGroupRow;