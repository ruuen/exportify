import { SearchMode } from "./types";
import { useState } from "react";
import PageHeader from "./components/PageHeader";
import SearchModeSelect from "./components/SearchModeSelect";
import ErrorBoundary from "./components/ErrorBoundary";
import PublicPlaylistView from "./components/PublicPlaylistView";
import PrivatePlaylistView from "./components/PrivatePlaylistView";
import { checkUserLoggedIn } from "./utils/auth";

function App() {
  const [searchMode, setSearchMode] = useState<SearchMode>("public");
  const isLoggedIn = checkUserLoggedIn();

  function changeSearchMode(e: React.MouseEvent<HTMLButtonElement>) {
    switch (e.currentTarget.dataset.mode) {
      case "public":
      case "private":
        setSearchMode(e.currentTarget.dataset.mode);
        break;
      default:
        return;
    }
  }

  return (
    <>
      <PageHeader isLoggedIn={isLoggedIn} />
      <main className="mt-6 mx-auto space-y-6 lg:mt-10 lg:space-y-10 lg:max-w-6xl">
        <SearchModeSelect
          searchMode={searchMode}
          isLoggedIn={isLoggedIn}
          handleClick={changeSearchMode}
        />
        <ErrorBoundary fallback={<p>Something went wrong... testing</p>}>
          {searchMode === "public" && <PublicPlaylistView />}
          {searchMode === "private" && <PrivatePlaylistView />}
        </ErrorBoundary>
      </main>
    </>
  );
}

export default App;
