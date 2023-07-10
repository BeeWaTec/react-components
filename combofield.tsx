import React, { MutableRefObject, ReactNode, useEffect, useRef, useState } from 'react'
import { Combobox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import axios, { AxiosInstance } from 'axios'
import { Float } from '@headlessui-float/react'

interface ComboFieldProps {
    className?: string,
    name?: string,
    id?: string,
    values?: { value: string | number, label: string }[],
    selected?: string | null,
    placeholder?: string,
    loadValuesPath?: {
        url: string,
        filter?: {
            [key: string]: string | number | boolean | null,
        },
        sort?: string,
        limit?: number,
        offset?: number,
        valueKey?: string,
        labelKey?: string,
        axiosInstance?: any,
    }
    style?: React.CSSProperties,
    prefix?: string | ReactNode,
    suffix?: string | ReactNode,
    disabled?: boolean,
    textAlignment?: 'left' | 'center' | 'right',
    enableResetButton?: boolean,
    onChange?: (e: string | null) => void,
}
export default function ComboField ({ className, enableResetButton = false, ...props }: ComboFieldProps): React.ReactElement {

    // Create references
    let retryTimer: MutableRefObject<NodeJS.Timeout | null> = useRef(null)
    let updateTimer: MutableRefObject<NodeJS.Timeout | null> = useRef(null)
    let isMounted: MutableRefObject<boolean> = useRef<boolean>(false)
    let comboRef: MutableRefObject<HTMLDivElement | null> = useRef(null)
    const inputRef = useRef() as MutableRefObject<HTMLInputElement>

    // Create states
    const [selected, setSelected] = useState<string | null>(props.selected ?? null)
    const [values, setValues] = useState<{ value: string | number, label: string }[] | undefined>(props.values)
    const [showDropdown, setShowDropdown] = useState<boolean>(false)
    const [loadingData, setLoadingData] = useState<boolean>(false)

    // Create axios instance
    let axiosInstance: AxiosInstance | null;
    if (typeof props.loadValuesPath?.axiosInstance !== 'undefined' && props.loadValuesPath?.axiosInstance !== null) {
        axiosInstance = props.loadValuesPath.axiosInstance
    }
    else {
        axiosInstance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            validateStatus: () => true,
        });
    }

    // Call async
    async function loadData () {
        if (typeof props.loadValuesPath !== 'undefined' && props.loadValuesPath !== null && !loadingData) {
            setLoadingData(true)
            // Load values from server
            const response = await axiosInstance!.get(props.loadValuesPath.url, {
                params: {
                    filter: props.loadValuesPath.filter,
                    sort: props.loadValuesPath.sort,
                    limit: props.loadValuesPath.limit,
                    offset: props.loadValuesPath.offset,
                }
            }).catch((error) => {
                if (error.response && error.response.status !== 404) {
                    console.error(error)
                }
                return null
            })
            if (response != null && response.status == 200) {
                const data = response.data
                //console.log(props.loadValuesPath.filter)
                //console.log(data)
                if (typeof data !== 'undefined' && data !== null) {
                    const newValues = data.map((value: any) => {
                        let newValue: { value: string | number, label: string } = {
                            value: value[props.loadValuesPath?.valueKey || 'value'],
                            label: value[props.loadValuesPath?.labelKey || 'label'],
                        }
                        return newValue
                    })

                    // Update values
                    if (isMounted.current) {
                        setValues(newValues)
                    }

                    // Check if selected value is in the new values else set selected to null
                    if (selected !== undefined && selected !== null) {
                        let found = false
                        for (let i = 0; i < newValues.length; i++) {
                            if (newValues[i].value === selected) {
                                found = true
                                setSelected(newValues[i].value)
                                break
                            }
                        }
                        if (!found) {
                            if (isMounted.current) {
                                setSelected(null)
                            }
                        }
                    }
                }
                setLoadingData(false)
            }
            else {
                // Retry after 1 second
                if (retryTimer.current !== null) {
                    clearTimeout(retryTimer.current)
                }
                retryTimer.current = setTimeout(loadData, 1000)
            }
        }
    }

    // Load plate categories from the server
    useEffect(() => {

        // Predefine variables
        retryTimer.current = null
        isMounted.current = true

        // Call async function
        loadData();

        // Create update timer
        updateTimer.current = setInterval(loadData, 10000)

        // Clear timeout on unmount
        return () => {
            if (retryTimer.current) clearTimeout(retryTimer.current)
            if (updateTimer.current) clearTimeout(updateTimer.current)
            isMounted.current = false
        }
    }, [])

    // Update values if props change
    useEffect(() => {
        if (props.values !== values) {
            setValues(props.values)
        }
    }, [props.values])

    // Update selected if props change
    useEffect(() => {
        if (props.selected !== selected) {
            setSelected(props.selected)
        }
    }, [props.selected])

    // Call onChange function if selected value changes
    /*useEffect(() => {
        if (props.onChange && !loadingData && isMounted.current ) {
            props.onChange(selected)
        }
    }, [selected])*/

    // Load data if filter, sort, limit or offset changes
    useEffect(() => {
        if (typeof props.loadValuesPath !== 'undefined' && props.loadValuesPath !== null) {
            loadData()
        }
    }, [props.loadValuesPath?.filter, props.loadValuesPath?.sort, props.loadValuesPath?.limit, props.loadValuesPath?.offset])

    return (
        <div
            className={`relative flex items-stretch w-full border-2 border-solid border-gray-300 shadow-sm focus:border-theme-primary-light focus-within:border-slate-600 sm:text-sm h-8 transition-colors ${className}`}
            style={{
                // Inner border when input is focused
                ...props.style
            }}
        >

            {/* Prefix */}
            {typeof props.prefix == 'string' && props.prefix !== '' &&
                <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
                    <span className="text-gray-500">{props.prefix}</span>
                </div>
            }
            {typeof props.prefix !== 'string' && typeof props.prefix !== 'undefined' && props.prefix !== null &&
                <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
                    {props.prefix}
                </div>
            }
            {((typeof props.suffix == 'string' && props.suffix !== '') || (typeof props.suffix !== 'undefined' && props.suffix !== null)) &&
                <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
                    <div className="w-px h-6 bg-gray-300"></div>
                </div>
            }

            {/* Combo Field */}
            <Combobox
                ref={comboRef}
                as="div"
                className={`w-full h-full`}
                disabled={props.disabled}
                value={values?.find((value) => {
                    return value.value === selected
                }) || null}
                onChange={(selected: any) => {
                    if (selected) {
                        setSelected(selected.value)
                        if (props.onChange) {
                            props.onChange(selected.value)
                        }
                    }
                    else {
                        setSelected(null)
                        if (props.onChange) {
                            props.onChange(selected.value)
                        }
                    }
                }}
            >
                <Combobox.Button
                    className={`block w-full h-full`}
                >
                    <Combobox.Input 
                        className={`w-full h-full cursor-pointer inset-y-0 items-center grow pr-2 pl-2 ${props.textAlignment == 'right' ? 'text-right' : props.textAlignment == 'center' ? 'text-center' : 'text-left'} border-0 focus:ring-0 focus:border-0 focus:outline-none`}
                        displayValue={(value: any) => value?.label}
                        readOnly={true}
                        onChange={(e) => { }}
                    />
                </Combobox.Button>
                <Combobox.Button className={`absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none ${props.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </Combobox.Button>

                {values && values.length > 0 && (
                    <Combobox.Options static={showDropdown} className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ml-0">
                        {values.map((value) => (
                            <Combobox.Option
                                key={value.value}
                                value={value}
                                className={({ active }) =>
                                    classNames(
                                        'relative cursor-default select-none py-2 pl-3 pr-9',
                                        active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                    )
                                }
                            >
                                {({ active, selected }) => (
                                    <>
                                        <span className={classNames('block truncate', selected && 'font-semibold')}>{value.label}</span>

                                        {selected && (
                                            <span
                                                className={classNames(
                                                    'absolute inset-y-0 right-0 flex items-center pr-4',
                                                    active ? 'text-white' : 'text-indigo-600'
                                                )}
                                            >
                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                        )}
                                    </>
                                )}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                )}
            </Combobox>


            {/* Suffix */}
            {
                ((typeof props.suffix == 'string' && props.suffix !== '') || (typeof props.suffix !== 'undefined' && props.suffix !== null)) &&
                <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
                    <div className="w-px h-6 bg-gray-300"></div>
                </div>
            }
            {
                typeof props.suffix == 'string' && props.suffix !== '' &&
                <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
                    <span className="text-gray-500">{props.suffix}</span>
                </div>
            }
            {
                typeof props.suffix !== 'string' && typeof props.suffix !== 'undefined' && props.suffix !== null &&
                <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
                    {props.suffix}
                </div>
            }

            {/* Show reset button if requested */}
            {
                typeof enableResetButton !== 'undefined' && enableResetButton &&
                <>
                    <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
                        <div className="w-px h-6 bg-gray-300"></div>
                    </div>
                    <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">

                        <button
                            className="w-4 h-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                            disabled={typeof props.disabled !== 'undefined' ? props.disabled : false}
                            onClick={(e) => {
                                e.preventDefault()
                                setSelected(null)
                                if (props.onChange) {
                                    props.onChange(null)
                                }
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>

                    </div>
                </>
            }
        </div >
    )
}