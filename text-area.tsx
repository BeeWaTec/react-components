import React, { forwardRef, MutableRefObject, ReactNode, RefObject, useEffect, useRef, useState } from "react";
import axiosInstance from "@/helpers/base/axios";
import { toast } from "react-toastify";
import classNames from "classnames";

interface TextAreaProps {
  className?: string;
  name?: string;
  id?: string;
  value?: string | number;
  placeholder?: string;
  required?: boolean;
  hideWhenvalue?: string | number;
  prefix?: string | ReactNode;
  suffix?: string | ReactNode;
  disabled?: boolean;
  validationRulesPath?: string;
  showSpinner?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
  updateValuePath?: string;
  updateValueMethod?: "post" | "put" | "patch";
  updateValueParams?: any;
  updateValueKey?: string;
  requireAccept?: boolean;
  readOnly?: boolean;
  style?: React.CSSProperties;
  onChange?: (value: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
const TextArea = forwardRef(
  (
    {
      className,
      updateValueKey = "value",
      updateValueMethod = "post",
      disabled = false,
      showSpinner = false,
      resize = "vertical",
      requireAccept = false,
      ...props
    }: TextAreaProps,
    ref,
  ) => {
    // Reference to input field
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Create states
    const [value, setValue] = useState<string | number | undefined>(props.value);
    const [valueEdited, setValueEdited] = useState<string | number | undefined>();
    const [ongoingSubmit, setOngoingSubmit] = useState<boolean>(false);

    // Create handlers
    async function updateValue(e: React.ChangeEvent<HTMLTextAreaElement>) {
      e.preventDefault();
      if (ongoingSubmit) return;
      try {
        setOngoingSubmit(true);
        const formData = new FormData();
        formData.append(updateValueKey, inputRef.current?.value || "");
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
            if (typeof data.required !== "undefined" && data.required !== null) {
              if (inputRef.current) {
                inputRef.current.required = data.required;
              }
            }
          } else {
            // Retry after 1 second
            setTimeout(asyncUseEffect, 5000);
          }
        }
      }
      asyncUseEffect();
    }, [props.validationRulesPath]);

    // Update value when props change
    useEffect(() => {
      setValue(props.value);
      setValueEdited(undefined);
    }, [props.value]);

    return (
      <div
        className={`relative flex items-stretch w-full border-2 border-solid border-gray-300 shadow-sm focus:border-theme-primary-light focus-within:border-slate-600 sm:text-sm h-24 transition-colors ${className}`}
        style={{
          // Inner border when input is focused
          ...props.style,
        }}
      >
        {/* Accept and decline buttons if requireAccept is true */}
        {typeof requireAccept !== "undefined" && requireAccept === true && (
          <>
            <div
              className={`inset-y-0 ml-2 mr-2 grow-0 flex flex-row justify-center items-center select-none ${typeof valueEdited !== "undefined" ? "opacity-100" : "opacity-50"}`}
            >
              <button
                className="w-6 h-6 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={typeof disabled !== "undefined" ? disabled : false}
                onClick={(e) => {
                  e.preventDefault();
                  let dataAsChangeEvent = {
                    target: {
                      value: valueEdited,
                    },
                  } as React.ChangeEvent<HTMLTextAreaElement>;
                  if (props.onChange) props.onChange(dataAsChangeEvent);
                  if (props.updateValuePath) updateValue(dataAsChangeEvent);
                  setValue(valueEdited);
                  setValueEdited(undefined);
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
                className="w-6 h-6 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={typeof disabled !== "undefined" ? disabled : false}
                onClick={(e) => {
                  e.preventDefault();
                  setValueEdited(undefined);
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
            </div>
          </>
        )}

        {/* Prefix */}
        {typeof props.prefix === "string" && props.prefix !== "" && (
          <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
            <span className="text-gray-500">{props.prefix}</span>
          </div>
        )}
        {typeof props.prefix !== "string" && typeof props.prefix !== "undefined" && props.prefix !== null && (
          <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
            {props.prefix}
          </div>
        )}
        {((typeof props.suffix === "string" && props.suffix !== "") ||
          (typeof props.suffix !== "undefined" && props.suffix !== null)) && (
          <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
            <div className="w-px h-6 bg-gray-300"></div>
          </div>
        )}

        {/* Input Field */}
        <textarea
          ref={inputRef}
          className={classNames(
            `inset-y-0 items-center grow pr-2 pl-2 border-0 focus:ring-0 focus:border-0 focus:outline-none`,
            {
              "resize-none": resize === "none",
              "resize-vertical": resize === "vertical",
              "resize-horizontal": resize === "horizontal",
              "resize-both": resize === "both",
            },
          )}
          name={typeof props.name !== "undefined" ? props.name : ""}
          style={{
            minHeight: "100%",
          }}
          id={props.id}
          required={typeof props.required !== "undefined" ? props.required : false}
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
          disabled={typeof disabled !== "undefined" ? disabled : false}
          readOnly={typeof props.readOnly !== "undefined" ? props.readOnly : false}
          onChange={(e) => {
            setValueEdited(e.target.value);
            if (props.onChange && !requireAccept) props.onChange(e);
            if (props.updateValuePath && !requireAccept) updateValue(e);
          }}
        />

        {/* Suffix */}
        {((typeof props.suffix === "string" && props.suffix !== "") ||
          (typeof props.suffix !== "undefined" && props.suffix !== null)) && (
          <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
            <div className="w-px h-6 bg-gray-300"></div>
          </div>
        )}
        {typeof props.suffix === "string" && props.suffix !== "" && (
          <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
            <span className="text-gray-500">{props.suffix}</span>
          </div>
        )}
        {typeof props.suffix !== "string" && typeof props.suffix !== "undefined" && props.suffix !== null && (
          <div className="inset-y-0 mr-2 grow-0 flex flex-col justify-center items-center select-none">
            {props.suffix}
          </div>
        )}
      </div>
    );
  },
);

// Set display name
TextArea.displayName = "TextArea";

export default TextArea;
export type { TextAreaProps };
