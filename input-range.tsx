import React, {
  forwardRef,
  MutableRefObject,
  ReactNode,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import axiosInstance from "@/helpers/base/axios";
import { toast } from "react-toastify";
import Spinner from "./spinner";
import classNames from "classnames";
import "./input-range.module.css";

interface InputRangeProps {
  id?: string;
  name?: string;
  className?: string;
  required?: boolean;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  suffix?: ReactNode | string;
  prefix?: ReactNode | string;
  value?: string | number;
  disabled?: boolean;
  style?: React.CSSProperties;
  readOnly?: boolean;
  checked?: boolean;
  onChange?: (value: React.ChangeEvent<HTMLInputElement>) => Promise<boolean> | boolean | void;
  onBlur?: (value: React.FocusEvent<HTMLInputElement>) => void;
  onPaste?: (value: React.ClipboardEvent<HTMLInputElement>) => void;
  onDeclinePressed?: () => void;
  onAcceptPressed?: () => void;
  onSuffixPressed?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onPrefixPressed?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}
const InputRange = forwardRef(
  (
    {
      className,
      disabled,
      onDeclinePressed,
      onAcceptPressed,
      onSuffixPressed,
      onPrefixPressed,
      ...props
    }: InputRangeProps,
    ref,
  ) => {
    let timerSelectAll: any = null;

    // Reference to input field
    const inputRef = useRef(null) as RefObject<HTMLInputElement>;

    // Create states
    const [value, setValue] = useState<string | number | undefined>(props.value);
    const [valueEdited, setValueEdited] = useState<string | number | undefined>();
    const [ongoingSubmit, setOngoingSubmit] = useState<boolean>(false);

    // Update value when props change
    useEffect(() => {
      setValue(props.value);
      setValueEdited(undefined);
    }, [props.value]);

    return (
      <div
        className={classNames(
          `transition-colors`,
          "relative border-2 border-solid border-gray-300 shadow-sm focus:border-theme-primary-light focus-within:border-slate-600 sm:text-sm h-8 flex items-stretch w-full",
          className,
        )}
        style={{
          // Inner border when input is focused
          ...props.style,
        }}
      >
        {/* Input Field */}
        <input
          ref={inputRef}
          style={{ minWidth: 0, maxWidth: "100%" }}
          className="slider"
          type="range"
          name={props.name}
          id={props.id}
          step={props.step}
          required={typeof props.required !== "undefined" ? props.required : false}
          value={typeof valueEdited !== "undefined" ? valueEdited : typeof value !== "undefined" ? value : ""}
          min={typeof props.min !== "undefined" ? props.min : undefined}
          max={typeof props.max !== "undefined" ? props.max : undefined}
          disabled={typeof disabled !== "undefined" ? disabled : false}
          readOnly={typeof props.readOnly !== "undefined" ? props.readOnly : false}
          checked={typeof props.checked !== "undefined" ? props.checked : false}
          onFocus={(e) => {
            clearTimeout(timerSelectAll);
          }}
          onBlur={(e) => {
            clearTimeout(timerSelectAll);
            if (props.onBlur) props.onBlur(e);
          }}
          onChange={(e) => {
            setValueEdited(e.target.value);
            if (props.onChange) props.onChange(e);
          }}
          onPaste={(e) => {
            if (props.onPaste) props.onPaste(e);
          }}
        />

        {/* Text overlay */}
        <div
          className={classNames(
            "absolute inset-0 flex items-center justify-center",
            "text-white font-bold text-lg text-center",
            "select-none pointer-events-none",
          )}
        >
          {typeof props.prefix !== "undefined" && (
            <div
              className={classNames("text-white font-bold text-lg text-center", "select-none pointer-events-none")}
              onClick={(e) => {
                if (onPrefixPressed) onPrefixPressed(e);
              }}
            >
              {props.prefix}
            </div>
          )}
          {typeof valueEdited !== "undefined" ? valueEdited : typeof value !== "undefined" ? value : ""}
          {typeof props.suffix !== "undefined" && (
            <div
              className={classNames("text-white font-bold text-lg text-center", "select-none pointer-events-none")}
              onClick={(e) => {
                if (onSuffixPressed) onSuffixPressed(e);
              }}
            >
              {props.suffix}
            </div>
          )}
        </div>
      </div>
    );
  },
);

// Set display name
InputRange.displayName = "InputRange";

export default InputRange;
export type { InputRangeProps };
