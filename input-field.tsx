import React, { forwardRef, MutableRefObject, ReactNode, useEffect, useRef, useState } from 'react'
import axiosInstance from '@/helpers/base/axios'
import { toast } from 'react-toastify'
import Spinner from './spinner';

interface InputFieldProps {
    className?: string,
    type?: string,
    name?: string,
    id?: string,
    value?: string | number,
    placeholder?: string,
    pattern?: string,
    required?: boolean,
    step?: string | number,
    min?: string | number,
    max?: string | number,
    hideWhenvalue?: string | number,
    prefix?: string | ReactNode,
    suffix?: string | ReactNode,
    disabled?: boolean,
    validationRulesPath?: string,
    showSpinner?: boolean,
    updateValuePath?: string,
    updateValueMethod?: 'post' | 'put' | 'patch',
    updateValueParams?: any,
    updateValueKey?: string,
    requireAccept?: boolean,
    readOnly?: boolean,
    onChange?: (value: React.ChangeEvent<HTMLInputElement>) => void,
    onPaste?: (value: React.ClipboardEvent<HTMLInputElement>) => void,
    onDeclinePressed?: () => void,
    onAcceptPressed?: () => void,
    onSuffixPressed?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    onPrefixPressed?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    keepDeclineButtonActive?: boolean,
}
const InputField = forwardRef(({ className, keepDeclineButtonActive = true, updateValueKey = 'value', updateValueMethod = 'post', disabled = false, showSpinner = false, requireAccept = false, onDeclinePressed, onAcceptPressed, onSuffixPressed, onPrefixPressed, ...props }: InputFieldProps, ref) => {

    // Reference to input field
    const inputRef = useRef() as MutableRefObject<HTMLInputElement>

    // Create states
    const [value, setValue] = useState<string | number | undefined>(props.value)
    const [valueEdited, setValueEdited] = useState<string | number | undefined>()
    const [ongoingSubmit, setOngoingSubmit] = useState<boolean>(false)

    // Create handlers
    async function updateValue(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        if (ongoingSubmit) return;
        try {
            setOngoingSubmit(true)
            var formData = new FormData();
            formData.append(updateValueKey, inputRef.current.value)
            if (typeof props.updateValueParams !== 'undefined' && props.updateValueParams !== null) {
                for (const [key, value] of Object.entries(props.updateValueParams)) {
                    formData.append(key, value as string)
                }
            }
            const result = await axiosInstance[updateValueMethod](props.updateValuePath || '', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            if (result.status === 200) {

                // Create toast
                toast.success('Changed saved successfully');

                // Call onAdded callback
                if (props.onChange) props.onChange(result.data.data)
            }
            else {
                console.warn(result)
                toast.error(result.data.message);
            }
        } catch (err) {
            console.warn(err)
            toast.error('Error saving changes');
        }
        finally {
            setOngoingSubmit(false)
        }
    }

    // Load validation rules from server
    useEffect(() => {
        // Call async
        async function asyncUseEffect() {
            if (typeof props.validationRulesPath !== 'undefined' && props.validationRulesPath !== null) {
                const response = await axiosInstance.get(props.validationRulesPath).catch((error) => {
                    if (error.response && error.response.status !== 404) {
                        //console.log(`Error loading validation rules for input field ${props.name} from ${props.validationRulesPath}`)
                    }
                    return null
                })
                if (response != null && response.status == 200) {
                    const data = response.data
                    if (typeof data.pattern !== 'undefined' && data.pattern !== null) {
                        inputRef.current.pattern = data.pattern
                    }
                    if (typeof data.required !== 'undefined' && data.required !== null) {
                        inputRef.current.required = data.required
                    }
                    if (typeof data.step !== 'undefined' && data.step !== null) {
                        inputRef.current.step = data.step
                    }
                    if (typeof data.min !== 'undefined' && data.min !== null) {
                        inputRef.current.min = data.min
                    }
                    if (typeof data.max !== 'undefined' && data.max !== null) {
                        inputRef.current.max = data.max
                    }
                }
                else {
                    // Retry after 1 second
                    setTimeout(asyncUseEffect, 5000)
                }
            }
        }
        asyncUseEffect();
    }, [])

    // Update value when props change
    useEffect(() => {
        setValue(props.value)
        setValueEdited(undefined)
    }, [props.value])

    return (
        <div className={`relative flex items-stretch w-full border-2 border-solid rounded-md border-gray-300 shadow-sm focus:border-theme-primary-light focus:ring-indigo-500 sm:text-sm h-8 ${className}`}>

            {/* Accept and decline buttons if requireAccept is true */}
            {typeof requireAccept !== 'undefined' && requireAccept == true &&
                <>
                    <div className={`inset-y-0 ml-2 mr-2 grow-0 flex flex-row justify-center items-center select-none w-12`}>
                        {ongoingSubmit || showSpinner ? (
                            <div
                                className="h-6 w-6 absolute top-auto left-auto right-auto bottom-auto"
                            >
                                <Spinner className='h-6 w-6' />
                            </div>
                        ) : (
                            <>
                                <button
                                    className={`w-6 h-6 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50`}
                                    disabled={typeof disabled !== 'undefined' && disabled == true ? true : typeof valueEdited === "undefined" ? true : false}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        let dataAsChangeEvent = {
                                            target: {
                                                value: valueEdited
                                            }
                                        } as React.ChangeEvent<HTMLInputElement>
                                        if (props.onChange) props.onChange(dataAsChangeEvent)
                                        if (props.updateValuePath) updateValue(dataAsChangeEvent)
                                        setValue(valueEdited)
                                        setValueEdited(undefined)
                                        if (onAcceptPressed) onAcceptPressed()
                                    }}
                                >
                                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </button>
                                <button
                                    className="w-6 h-6 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                                    disabled={typeof disabled !== 'undefined' && disabled == true ? true : typeof valueEdited === "undefined" && !keepDeclineButtonActive ? true : false}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setValueEdited(undefined)
                                        if (onDeclinePressed) onDeclinePressed()
                                    }}
                                >
                                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </>
            }

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

            {/* Input Field */}
            <input
                ref={inputRef}
                className={`inset-y-0 items-center grow pr-2 pl-2 ${props.type == 'number' ? 'text-right' : 'text-left'} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed h-full`}
                style={{ minWidth: 0, maxWidth: '100%' }}
                type={typeof props.type !== 'undefined' ? props.type : 'text'}
                name={typeof props.name !== 'undefined' ? props.name : ''}
                id={props.id}
                step={props.step}
                required={typeof props.required !== 'undefined' ? props.required : false}
                pattern={typeof props.pattern !== 'undefined' ? props.pattern : undefined}
                value={typeof valueEdited !== 'undefined' ? valueEdited == props.hideWhenvalue ? '' : valueEdited : typeof value !== 'undefined' ? value == props.hideWhenvalue ? '' : value : ''}
                placeholder={typeof props.placeholder !== 'undefined' ? props.placeholder : ''}
                min={typeof props.min !== 'undefined' ? props.min : undefined}
                max={typeof props.max !== 'undefined' ? props.max : undefined}
                disabled={typeof disabled !== 'undefined' ? disabled : false}
                readOnly={typeof props.readOnly !== 'undefined' ? props.readOnly : false}
                onChange={(e) => {
                    setValueEdited(e.target.value)
                    if (props.onChange && !requireAccept) props.onChange(e)
                    if (props.updateValuePath && !requireAccept) updateValue(e)
                }}
                onPaste={(e) => {
                    if (props.onPaste) props.onPaste(e)
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