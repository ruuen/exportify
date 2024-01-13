import { SearchMode, SpotifyUser } from "./types";
import { useState } from "react";
import PageHeader from "./components/PageHeader";
import SearchModeSelect from "./components/SearchModeSelect";
import PublicPlaylistView from "./components/PublicPlaylistView";

function App() {
  const [searchMode, setSearchMode] = useState<SearchMode>("public");
  const [user, setUser] = useState<SpotifyUser | null>(null);

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
      <PageHeader />
      <main className="mt-6 space-y-6">
        <SearchModeSelect
          searchMode={searchMode}
          isLoggedIn={user}
          handleClick={changeSearchMode}
        />
        {searchMode === "public" && <PublicPlaylistView />}
      </main>
    </>
  );
}

export default App;
