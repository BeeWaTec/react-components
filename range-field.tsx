import React, { forwardRef, MutableRefObject, ReactNode, useEffect, useRef, useState } from 'react'
import axiosInstance from '@/helpers/base/axios'
import { toast } from 'react-toastify'
import Spinner from './spinner';

interface InputFieldProps {
    className?: string,
    type?: string,
    name?: string,
    id?: string,
    valueFrom?: string | number,
    valueTo?: string | number,
    placeholderFrom?: string,
    placeholderTo?: string,
    pattern?: string,
    required?: boolean,
    step?: string | number,
    min?: string | number,
    max?: string | number,
    hideWhenvalue?: string | number,
    prefix?: string | ReactNode,
    suffix?: string | ReactNode,
    disabled?: boolean,
    showSpinner?: boolean,
    readOnly?: boolean,
    onFromChange?: (value: React.ChangeEvent<HTMLInputElement>) => void,
    onToChange?: (value: React.ChangeEvent<HTMLInputElement>) => void,
    onSuffixPressed?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    onPrefixPressed?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    keepDeclineButtonActive?: boolean,
}
const InputField = forwardRef(({ className, keepDeclineButtonActive = true, disabled = false, showSpinner = false, onSuffixPressed, onPrefixPressed, ...props }: InputFieldProps, ref) => {

    // Reference to input field
    const inputRefFrom = useRef() as MutableRefObject<HTMLInputElement>
    const inputRefTo = useRef() as MutableRefObject<HTMLInputElement>

    // Create states
    const [valueFrom, setValueFrom] = useState<string | number | undefined>(props.valueFrom)
    const [valueTo, setValueTo] = useState<string | number | undefined>(props.valueTo)

    // Update value when props change
    useEffect(() => {
        setValueFrom(props.valueFrom)
        setValueTo(props.valueTo)
    }, [props.valueFrom, props.valueTo])

    return (
        <div className={`relative flex items-stretch w-full border-2 border-solid rounded-md border-gray-300 shadow-sm focus:border-theme-primary-light focus:ring-indigo-500 sm:text-sm h-8 ${className}`}>

            {/* Prefix */}
            {typeof props.prefix == 'string' && props.prefix !== '' &&
                <div
                    className={`inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none ${onPrefixPressed ? 'cursor-pointer' : ''}`}
                    onClick={(e) => onPrefixPressed && onPrefixPressed(e)}
                >
                    <span className="text-gray-500">{props.prefix}</span>
                </div>
            }
            {typeof props.prefix !== 'string' && typeof props.prefix !== 'undefined' && props.prefix !== null &&
                <div
                    className={`inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none ${onPrefixPressed ? 'cursor-pointer' : ''}`}
                    onClick={(e) => onPrefixPressed && onPrefixPressed(e)}
                >
                    {props.prefix}
                </div>
            }
            {((typeof props.suffix == 'string' && props.suffix !== '') || (typeof props.suffix !== 'undefined' && props.suffix !== null)) &&
                <div
                    className={`inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none ${onPrefixPressed ? 'cursor-pointer' : ''}`}
                    onClick={(e) => onPrefixPressed && onPrefixPressed(e)}
                >
                    <div className="w-px h-6 bg-gray-300"></div>
                </div>
            }

            {/* Input Field - From */}
            <input
                ref={inputRefFrom}
                className={`inset-y-0 items-center grow pr-2 pl-2 ${props.type == 'number' ? 'text-right' : 'text-left'} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed h-full`}
                style={{ minWidth: 0, maxWidth: '100%' }}
                type={typeof props.type !== 'undefined' ? props.type : 'text'}
                name={typeof props.name !== 'undefined' ? props.name : ''}
                id={props.id}
                step={props.step}
                required={typeof props.required !== 'undefined' ? props.required : false}
                pattern={typeof props.pattern !== 'undefined' ? props.pattern : undefined}
                value={typeof valueFrom !== 'undefined' ? valueFrom == props.hideWhenvalue ? '' : valueFrom : ''}
                placeholder={typeof props.placeholderFrom ?? ''}
                min={typeof props.min !== 'undefined' ? props.min : undefined}
                max={typeof props.max !== 'undefined' ? props.max : undefined}
                disabled={typeof disabled !== 'undefined' ? disabled : false}
                readOnly={typeof props.readOnly !== 'undefined' ? props.readOnly : false}
                onChange={(e) => {
                    if (props.onFromChange) props.onFromChange(e)
                }}
            />

            {/* Suffix */}
            {((typeof props.suffix == 'string' && props.suffix !== '') || (typeof props.suffix !== 'undefined' && props.suffix !== null)) &&
                <div
                    className={`inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none ${onSuffixPressed ? 'cursor-pointer' : ''}`}
                    onClick={(e) => onSuffixPressed && onSuffixPressed(e)}
                >
                    <div className="w-px h-6 bg-gray-300"></div>
                </div>
            }
            {typeof props.suffix == 'string' && props.suffix !== '' &&
                <div
                    className={`inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none ${onSuffixPressed ? 'cursor-pointer' : ''}`}
                    onClick={(e) => onSuffixPressed && onSuffixPressed(e)}
                >
                    <span className="text-gray-500">{props.suffix}</span>
                </div>
            }
            {typeof props.suffix !== 'string' && typeof props.suffix !== 'undefined' && props.suffix !== null &&
                <div
                    className={`inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none ${onSuffixPressed ? 'cursor-pointer' : ''}`}
                    onClick={(e) => onSuffixPressed && onSuffixPressed(e)}
                >
                    {props.suffix}
                </div>
            }

            {/* Arrow if type is number */}
            {typeof props.type !== 'undefined' && props.type == 'number' &&
                <>
                    <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
                        <div className="w-px h-6 bg-gray-300"></div>
                    </div>
                    <div className="inset-y-0 grow-0 flex flex-col justify-center items-center select-none">
                        <div className="flex flex-col justify-center items-center">
                            <button
                                className="w-4 h-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                                disabled={typeof disabled !== 'undefined' ? disabled : false}
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (typeof inputRef.current !== 'undefined' && inputRef.current !== null) {
                                        inputRef.current.stepUp()
                                        inputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
                                    }
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                                </svg>
                            </button>
                            <button
                                className="w-4 h-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                                disabled={typeof disabled !== 'undefined' ? disabled : false}
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (typeof inputRef.current !== 'undefined' && inputRef.current !== null) {
                                        inputRef.current.stepDown()
                                        inputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
                                    }
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </>
            }
        </div>
    )
});

// Set display name
InputField.displayName = 'InputField';

export default InputField;
export type { InputFieldProps };