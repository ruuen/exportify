import { SearchMode, SpotifyUser } from "../types";
import clsx from "clsx";

interface SearchModeSelectProps {
  searchMode: SearchMode;
  isLoggedIn: SpotifyUser | null;
  handleClick(e: React.MouseEvent<HTMLButtonElement>): void;
}

function SearchModeSelect({
  searchMode,
  isLoggedIn,
  handleClick,
}: SearchModeSelectProps) {
  const activeClasses = "bg-slate-800 text-slate-100 hover:text-slate-50";
  const inactiveClasses = "bg-transparent hover:text-slate-50";
  const disabledClasses =
    "bg-transparent text-slate-600 hover:cursor-not-allowed";

  return (
    <nav className="py-2 border-y border-slate-700">
      <h3 className="sr-only">Select playlist search mode</h3>
      <ul className="flex gap-3 justify-center items-center">
        <li>
          <button
            data-mode="public"
            onClick={handleClick}
            type="button"
            className={clsx([
              "py-1",
              "px-3",
              "rounded-md",
              "transition-colors",
              {
                [activeClasses]: searchMode === "public",
                [inactiveClasses]: searchMode !== "public",
              },
            ])}
          >
            Public
          </button>
        </li>
        <li>
          <button
            disabled={!isLoggedIn}
            data-mode="private"
            onClick={isLoggedIn ? handleClick : undefined}
            type="button"
            className={clsx([
              "py-1",
              "px-3",
              "rounded-md",
              "transition-colors",
              {
                [activeClasses]: searchMode === "private" && isLoggedIn,
                [inactiveClasses]: searchMode !== "private" && isLoggedIn,
                [disabledClasses]: !isLoggedIn,
              },
            ])}
          >
            Private & Saved
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default SearchModeSelect;
