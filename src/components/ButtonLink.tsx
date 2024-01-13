import { ButtonColourScheme } from "../types";
import getButtonColourClasses from "../utils/getButtonColourClasses";

interface ButtonLinkProps {
  href: string;
  text: string;
  colourScheme?: ButtonColourScheme;
}

function ButtonLink({ href, text, colourScheme = "default" }: ButtonLinkProps) {
  const colourClasses = getButtonColourClasses(colourScheme);

  return (
    <a
      className={`block py-2 px-5 w-fit rounded-lg shadow-md border transition-colors ${colourClasses}`}
      href={href}
    >
      {text}
    </a>
  );
}

export default ButtonLink;
