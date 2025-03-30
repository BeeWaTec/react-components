import React, {
  forwardRef,
  MutableRefObject,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import axiosInstance from "@/helpers/base/axios";
import { toast } from "react-toastify";
import Spinner from "./spinner";
import classNames from "classnames";

interface InputFieldProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  name?: string;
  id?: string;
  value?: string | number;
  placeholder?: string;
  pattern?: string;
  required?: boolean;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  prefixElement?: ReactNode;
  suffixElement?: ReactNode;
  hideWhenvalue?: string | number;
  suffix?: string | ReactNode;
  disabled?: boolean;
  validationRulesPath?: string;
  showSpinner?: boolean;
  updateValuePath?: string;
  updateValueMethod?: "post" | "put" | "patch";
  updateValueParams?: any;
  updateValueKey?: string;
  requireAccept?: boolean;
  style?: React.CSSProperties;
  readOnly?: boolean;
  checked?: boolean;
  onFocusSelectAll?: boolean;
  onChange?: (value: React.ChangeEvent<HTMLInputElement>) => Promise<boolean> | boolean | void;
  onBlur?: (value: React.FocusEvent<HTMLInputElement>) => void;
  onPaste?: (value: React.ClipboardEvent<HTMLInputElement>) => void;
  onDeclinePressed?: () => void;
  onAcceptPressed?: () => void;
  onSuffixPressed?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onPrefixPressed?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  keepDeclineButtonActive?: boolean;
}
const InputField = forwardRef((props: InputFieldProps, ref) => {
  const {
    className,
    keepDeclineButtonActive = true,
    updateValueKey = "value",
    updateValueMethod = "post",
    disabled = false,
    showSpinner = false,
    requireAccept = false,
    onFocusSelectAll = false,
    onDeclinePressed,
    onAcceptPressed,
    onSuffixPressed,
    onPrefixPressed,
    ...rest
  } = props;

  let timerSelectAll: any = null;

  // Reference to input field
  const inputRef = useRef() as MutableRefObject<HTMLInputElement>;

  // Create states
  const [value, setValue] = useState<string | number | undefined>(props.value);
  const [valueEdited, setValueEdited] = useState<string | number | undefined>();
  const [ongoingSubmit, setOngoingSubmit] = useState<boolean>(false);

  // Create handlers
  async function updateValue(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (ongoingSubmit) return;
    try {
      setOngoingSubmit(true);
      const formData = new FormData();
      formData.append(updateValueKey, inputRef.current.value);
      if (typeof props.updateValueParams !== "undefined" && props.updateValueParams !== null) {
        for (const [key, value] of Object.entries(props.updateValueParams)) {
          formData.append(key, value as string);
        }
      }
      const result = await axiosInstance[updateValueMethod](props.updateValuePath || "", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (result.status === 200) {
        // Create toast
        toast.success("Changed saved successfully");

        // Call onAdded callback
        if (props.onChange) props.onChange(result.data.data);
      } else {
        console.warn(result);
        toast.error(result.data.message);
      }
    } catch (err) {
      console.warn(err);
      toast.error("Error saving changes");
    } finally {
      setOngoingSubmit(false);
    }
  }

  // Load validation rules from server
  useEffect(() => {
    // Call async
    async function asyncUseEffect() {
      if (typeof props.validationRulesPath !== "undefined" && props.validationRulesPath !== null) {
        const response = await axiosInstance.get(props.validationRulesPath).catch((error) => {
          if (error.response && error.response.status !== 404) {
            //console.log(`Error loading validation rules for input field ${props.name} from ${props.validationRulesPath}`)
          }
          return null;
        });
        if (response != null && response.status === 200) {
          const data = response.data;
          if (typeof data.pattern !== "undefined" && data.pattern !== null) {
            inputRef.current.pattern = data.pattern;
          }
          if (typeof data.required !== "undefined" && data.required !== null) {
            inputRef.current.required = data.required;
          }
          if (typeof data.step !== "undefined" && data.step !== null) {
            inputRef.current.step = data.step;
          }
          if (typeof data.min !== "undefined" && data.min !== null) {
            inputRef.current.min = data.min;
          }
          if (typeof data.max !== "undefined" && data.max !== null) {
            inputRef.current.max = data.max;
          }
        } else {
          // Retry after 1 second
          setTimeout(asyncUseEffect, 5000);
        }
      }
    }
    asyncUseEffect();
  }, []);

  // Update value when props change
  useEffect(() => {
    setValue(props.value);
    setValueEdited(undefined);
  }, [props.value]);

  return (
    <div
      className={classNames(
        `input-field transition-colors`,
        {
          "relative border-2 border-solid border-gray-300 shadow-sm focus:border-theme-primary-light focus-within:border-slate-600 text-sm h-8 flex items-stretch w-full":
            props.type !== "checkbox",
          "block w-5 h-5": props.type === "checkbox",
        },
        className,
      )}
      style={{
        // Inner border when input is focused
        ...props.style,
      }}
    >
      {/* Accept and decline buttons if requireAccept is true */}
      {typeof requireAccept !== "undefined" && requireAccept === true && (
        <>
          <div className={`inset-y-0 ml-2 mr-2 grow-0 flex flex-row justify-center items-center select-none w-12`}>
            {ongoingSubmit || showSpinner ? (
              <div className="h-6 w-6 absolute top-auto left-auto right-auto bottom-auto">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <button
                  className={`w-6 h-6 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50`}
                  disabled={
                    typeof disabled !== "undefined" && disabled === true
                      ? true
                      : typeof valueEdited === "undefined"
                        ? true
                        : false
                  }
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    let dataAsChangeEvent = {
                      target: {
                        value: valueEdited,
                      },
                    } as React.ChangeEvent<HTMLInputElement>;
                    if (props.onChange) {
                      const stop = await props.onChange(dataAsChangeEvent);
                      if (stop === false) {
                        return;
                      }
                    }
                    if (props.updateValuePath) updateValue(dataAsChangeEvent);
                    setValue(valueEdited);
                    setValueEdited(undefined);
                    if (onAcceptPressed) onAcceptPressed();
                  }}
                >
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
                <button
                  className="w-6 h-6 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                  disabled={
                    typeof disabled !== "undefined" && disabled === true
                      ? true
                      : typeof valueEdited === "undefined" && !keepDeclineButtonActive
                        ? true
                        : false
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setValueEdited(undefined);
                    if (onDeclinePressed) onDeclinePressed();
                  }}
                >
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Prefix */}
      {typeof props.prefix === "string" && props.prefix !== "" && (
        <div
          className={`mx-2 inset-y-0 grow-0 flex flex-col justify-center items-center select-none ${onPrefixPressed ? "cursor-pointer" : ""}`}
          onClick={(e) => onPrefixPressed && onPrefixPressed(e)}
        >
          <span className="text-gray-500">{props.prefix}</span>
        </div>
      )}
      {((typeof props.prefix === "string" && props.prefix !== "") ||
        (typeof props.prefix !== "undefined" && props.prefix !== null)) && (
        <div
          className={`inset-y-0 grow-0 flex flex-row justify-center items-stretch select-none ${onPrefixPressed ? "cursor-pointer" : ""}`}
          onClick={(e) => onPrefixPressed && onPrefixPressed(e)}
        >
          <div className="w-px bg-gray-300"></div>
        </div>
      )}
      {typeof props.prefixElement !== "undefined" && props.prefixElement !== null && (
        <div
          className={`mx-2 inset-y-0 grow-0 flex flex-col justify-center items-center select-none ${onPrefixPressed ? "cursor-pointer" : ""}`}
          onClick={(e) => onPrefixPressed && onPrefixPressed(e)}
        >
          {props.prefixElement}
        </div>
      )}

      {/* Input Field */}
      <input
        ref={inputRef}
        className={classNames(
          `inset-y-0 items-center grow pr-2 pl-2 border-0 focus:ring-0 focus:border-0 focus:outline-none`,
          {
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none":
              props.type != "checkbox",
            "text-right": props.type === "number",
            "text-left": props.type != "number",
            "h-full w-full": props.type === "checkbox",
          },
        )}
        style={{ minWidth: 0, maxWidth: "100%" }}
        type={typeof props.type !== "undefined" ? props.type : "text"}
        name={typeof props.name !== "undefined" ? props.name : ""}
        id={props.id}
        step={props.step}
        required={typeof props.required !== "undefined" ? props.required : false}
        pattern={typeof props.pattern !== "undefined" ? props.pattern : undefined}
        value={
          typeof valueEdited !== "undefined"
            ? valueEdited === props.hideWhenvalue
              ? ""
              : valueEdited
            : typeof value !== "undefined"
              ? value === props.hideWhenvalue
                ? ""
                : value
              : ""
        }
        placeholder={typeof props.placeholder !== "undefined" ? props.placeholder : ""}
        min={typeof props.min !== "undefined" ? props.min : undefined}
        max={typeof props.max !== "undefined" ? props.max : undefined}
        disabled={typeof disabled !== "undefined" ? disabled : false}
        readOnly={typeof props.readOnly !== "undefined" ? props.readOnly : false}
        checked={typeof props.checked !== "undefined" ? props.checked : false}
        onFocus={(e) => {
          clearTimeout(timerSelectAll);
          if (onFocusSelectAll) {
            timerSelectAll = setTimeout(() => {
              e.target.select();
            }, 100);
          }
        }}
        onBlur={(e) => {
          clearTimeout(timerSelectAll);
          if (props.onBlur) props.onBlur(e);
        }}
        onChange={(e) => {
          setValueEdited(e.target.value);
          if (props.onChange && !requireAccept) props.onChange(e);
          if (props.updateValuePath && !requireAccept) updateValue(e);
        }}
        onPaste={(e) => {
          if (props.onPaste) props.onPaste(e);
        }}
      />

      {/* Suffix */}
      {((typeof props.suffix === "string" && props.suffix !== "") ||
        (typeof props.suffix !== "undefined" && props.suffix !== null)) && (
        <div
          className={`inset-y-0 mr-2 grow-0 flex justify-center items-stretch select-none ${onSuffixPressed ? "cursor-pointer" : ""}`}
          onClick={(e) => onSuffixPressed && onSuffixPressed(e)}
        >
          <div className="w-px bg-gray-300"></div>
        </div>
      )}
      {typeof props.suffix === "string" && props.suffix !== "" && (
        <div
          className={`inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none ${onSuffixPressed ? "cursor-pointer" : ""}`}
          onClick={(e) => onSuffixPressed && onSuffixPressed(e)}
        >
          <span className="text-gray-500">{props.suffix}</span>
        </div>
      )}
      {typeof props.suffixElement !== "undefined" && props.suffixElement !== null && (
        <div
          className={`inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none ${onSuffixPressed ? "cursor-pointer" : ""}`}
          onClick={(e) => onSuffixPressed && onSuffixPressed(e)}
        >
          {props.suffixElement}
        </div>
      )}

      {/* Arrow if type is number */}
      {typeof props.type !== "undefined" && props.type === "number" && (
        <>
          <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
            <div className="w-px h-full bg-gray-300"></div>
          </div>
          <div className="inset-y-0 grow-0 mr-2 flex flex-col justify-center items-center select-none">
            <div className="flex flex-col justify-center items-center">
              <button
                className="w-4 h-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={typeof disabled !== "undefined" ? disabled : false}
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof inputRef.current !== "undefined" && inputRef.current !== null) {
                    inputRef.current.stepUp();
                    inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
                    if (props.onBlur) {
                      // Generate fake event
                      const fakeEvent = {
                        target: {
                          value: inputRef.current.value.toString(),
                          valueAsNumber: inputRef.current.valueAsNumber,
                        },
                      } as React.FocusEvent<HTMLInputElement>;
                      props.onBlur(fakeEvent);
                    }
                  }
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                </svg>
              </button>
              <button
                className="w-4 h-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={typeof disabled !== "undefined" ? disabled : false}
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof inputRef.current !== "undefined" && inputRef.current !== null) {
                    inputRef.current.stepDown();
                    inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
                    if (props.onBlur) {
                      // Generate fake event
                      const fakeEvent = {
                        target: {
                          value: inputRef.current.value.toString(),
                          valueAsNumber: inputRef.current.valueAsNumber,
                        },
                      } as React.FocusEvent<HTMLInputElement>;
                      props.onBlur(fakeEvent);
                    }
                  }
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// Set display name
InputField.displayName = "InputField";

export default InputField;
export type { InputFieldProps };
