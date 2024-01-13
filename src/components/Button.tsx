import { ComponentPropsWithoutRef } from "react";
import { ButtonColourScheme } from "../types";
import getButtonColourClasses from "../utils/getButtonColourClasses";
import clsx from "clsx";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  text: string;
  isFullWidth?: boolean;
  colourScheme?: ButtonColourScheme;
}

function Button(props: ButtonProps) {
  const {
    text,
    isFullWidth = false,
    colourScheme = "default",
    ...baseProps
  } = props;

  return (
    <button
      {...baseProps}
      className={clsx([
        "block py-2 px-5 rounded-lg shadow-md border transition-colors",
        getButtonColourClasses(colourScheme),
        {
          "w-fit": !isFullWidth,
          "w-full": isFullWidth,
        },
      ])}
    >
      {text}
    </button>
  );
}

export default Button;
