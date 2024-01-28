import { ComponentPropsWithoutRef } from "react";
import { ButtonColourScheme } from "../types";
import getButtonColourClasses from "../utils/getButtonColourClasses";
import clsx from "clsx";
import LoadingSpinner from "./LoadingSpinner";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  text: string;
  isFullWidth?: boolean;
  colourScheme?: ButtonColourScheme;
  isLoading?: boolean;
}

function Button(props: ButtonProps) {
  const {
    text,
    isFullWidth = false,
    colourScheme = "default",
    isLoading,
    ...baseProps
  } = props;

  return (
    <button
      {...baseProps}
      name={text}
      className={clsx([
        "block py-2 px-5 rounded-lg shadow-md border transition-colors",
        getButtonColourClasses(colourScheme),
        {
          "w-fit": !isFullWidth,
          "w-full": isFullWidth,
        },
      ])}
    >
      {isLoading && <LoadingSpinner />}
      {!isLoading && text}
    </button>
  );
}

export default Button;
