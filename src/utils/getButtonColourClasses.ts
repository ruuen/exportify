import { ButtonColourScheme } from "../types";
import clsx from "clsx";

function getButtonColourClasses(colourSchemeName: ButtonColourScheme): string {
  switch (colourSchemeName) {
    case "spotify":
      return clsx([
        "bg-green-500",
        "hover:bg-green-400",
        "border-slate-800",
        "hover:border-slate-900",
        "text-slate-800",
        "hover:text-slate-900",
      ]);
    case "light":
      return clsx([
        "bg-slate-700",
        "hover:bg-slate-600",
        "border-slate-600",
        "hover:border-slate-500",
        "text-slate-100",
        "hover:text-slate-50",
      ]);
    case "warning":
      return clsx([
        "bg-red-800",
        "hover:bg-red-700",
        "border-red-700",
        "hover:border-red-600",
        "text-slate-100",
        "hover:text-slate-50",
      ]);
    default:
      return clsx([
        "bg-slate-800",
        "hover:bg-slate-700",
        "border-slate-700",
        "hover:border-slate-600",
        "text-slate-100",
        "hover:text-slate-50",
      ]);
  }
}

export default getButtonColourClasses;
