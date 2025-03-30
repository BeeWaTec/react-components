import classNames from "classnames";
import React from "react";
import { Tooltip } from "react-tooltip";

interface FormGroupIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "ok" | "warning" | "error" | "disabled" | "loading" | "neutral" | "custom";
  customColor?: string;
  customTooltipContent?: string;
}
function FormGroupIndicator(props: FormGroupIndicatorProps) {
  const { className, status, customColor, ...restProps } = props;

  const uuid = Math.random().toString(36).substring(7);

  return (
    <>
      <Tooltip
        id={`form-group-indicator-ok-${uuid}`}
        place="top"
        content="Valid"
        border={"1px solid white"}
        style={{
          backgroundColor: "green",
          color: "white",
          borderRadius: "0.25rem",
        }}
      />
      <Tooltip
        id={`form-group-indicator-warning-${uuid}`}
        place="top"
        content="Warning"
        border={"1px solid white"}
        style={{
          backgroundColor: "yellow",
          color: "black",
          borderRadius: "0.25rem",
        }}
      />
      <Tooltip
        id={`form-group-indicator-error-${uuid}`}
        place="top"
        content="Invalid"
        border={"1px solid white"}
        style={{
          backgroundColor: "red",
          color: "white",
          borderRadius: "0.25rem",
        }}
      />
      <Tooltip
        id={`form-group-indicator-disabled-${uuid}`}
        place="top"
        content="Disabled"
        border={"1px solid white"}
        style={{
          backgroundColor: "gray",
          color: "white",
          borderRadius: "0.25rem",
        }}
      />
      <Tooltip
        id={`form-group-indicator-loading-${uuid}`}
        place="top"
        content="Loading"
        border={"1px solid white"}
        style={{
          backgroundColor: "blue",
          color: "white",
          borderRadius: "0.25rem",
        }}
      />
      <Tooltip
        id={`form-group-indicator-neutral-${uuid}`}
        place="top"
        content="Optional"
        border={"1px solid white"}
        style={{
          backgroundColor: "white",
          color: "black",
          borderRadius: "0.25rem",
        }}
      />
      <div
        data-tooltip-id={
          status === "ok"
            ? `form-group-indicator-ok-${uuid}`
            : status === "warning"
              ? `form-group-indicator-warning-${uuid}`
              : status === "error"
                ? `form-group-indicator-error-${uuid}`
                : status === "disabled"
                  ? `form-group-indicator-disabled-${uuid}`
                  : status === "loading"
                    ? `form-group-indicator-loading-${uuid}`
                    : status === "neutral"
                      ? `form-group-indicator-neutral-${uuid}`
                      : "form-group-indicator"
        }
        className={classNames(
          "w-[0.7rem] max-w-[0.7rem] min-w-[0.7rem] flex items-center justify-center form-group-indicator",
          {
            "bg-green-600": status === "ok",
            "bg-yellow-600": status === "warning",
            "bg-red-600": status === "error",
            "bg-gray-600": status === "disabled",
            "bg-blue-600 animate-pulse": status === "loading",
            "bg-white": status === "neutral",
          },
          className,
        )}
        style={{
          color: status === "custom" ? customColor : undefined,
        }}
        {...restProps}
      />
    </>
  );
}

export default FormGroupIndicator;
