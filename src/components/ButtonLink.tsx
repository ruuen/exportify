type ColourScheme = "default" | "spotify" | "light";

interface ButtonLinkProps {
  href: string;
  text: string;
  colourScheme?: ColourScheme;
}

function ButtonLink({ href, text, colourScheme = "default" }: ButtonLinkProps) {
  const colourClasses = getColourSchemeClasses(colourScheme);

  return (
    <a
      className={`block py-2 px-5 w-fit rounded-lg shadow-md border transition-colors ${colourClasses}`}
      href={href}
    >
      {text}
    </a>
  );
}

function getColourSchemeClasses(colourSchemeName: ColourScheme): string {
  switch (colourSchemeName) {
    case "spotify":
      return [
        "bg-green-500",
        "hover:bg-green-400",
        "border-slate-800",
        "hover:border-slate-900",
        "text-slate-800",
        "hover:text-slate-900",
      ].join(" ");
    case "light":
      return [
        "bg-slate-700",
        "hover:bg-slate-600",
        "border-slate-600",
        "hover:border-slate-500",
        "text-slate-100",
        "hover:text-slate-50",
      ].join(" ");
    default:
      return [
        "bg-slate-800",
        "hover:bg-slate-700",
        "border-slate-700",
        "hover:border-slate-600",
        "text-slate-100",
        "hover:text-slate-50",
      ].join(" ");
  }
}

export default ButtonLink;
