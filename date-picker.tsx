import React, { ReactElement, RefAttributes, ForwardRefRenderFunction, forwardRef } from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";

interface CustomDatePickerProps extends ReactDatePickerProps {
}
const DatePicker= forwardRef<HTMLInputElement, CustomDatePickerProps>((
    props,
    ref
) => {
    const { ...restProps } = props;

    return <>
        <div
            className="relative flex w-full border-2 border-solid rounded-md border-gray-300 shadow-sm focus:border-theme-primary-light focus:ring-indigo-500 sm:text-sm inset-y-0 items-center grow shrink-0 text-left mr-2"
        >
            <ReactDatePicker
                ref={ref as any}
                className="w-full p-2 "
                dateFormat={"yyyy-MM-dd"}
                timeFormat="HH:mm"
                placeholderText="yyyy-mm-dd"
                {...restProps}
            />
        </div>
    </>;
});


DatePicker.displayName = "DatePicker";

export default DatePicker;