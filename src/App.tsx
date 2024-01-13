import { SearchMode, SpotifyUser } from "./types";
import { useState } from "react";
import PageHeader from "./components/PageHeader";
import PlaylistCard from "./components/PlaylistCard";
import SearchModeSelect from "./components/SearchModeSelect";

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
      <main className="mt-5 space-y-5">
        <SearchModeSelect
          searchMode={searchMode}
          isLoggedIn={user}
          handleClick={changeSearchMode}
        />
        {searchMode === "public" && (
          <PlaylistCard
            coverImage="https://images.unsplash.com/photo-1704714673347-113cfe46485e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcwNDg1NjkxNA&ixlib=rb-4.0.3&q=80&w=300"
            title="Your Top Songs 2023"
            author="maxruuen"
          />
        )}
      </main>
    </>
  );
}

export default App;
