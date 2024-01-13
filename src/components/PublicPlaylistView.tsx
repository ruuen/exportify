import { SearchFormInputs } from "../types";
import SearchForm from "./SearchForm";

function PublicPlaylistView() {
  function handlePlaylistSearch(data: SearchFormInputs): void {
    console.log(data);
  }

  return (
    <>
      <SearchForm handlePlaylistSearch={handlePlaylistSearch} />
    </>
  );
}

export default PublicPlaylistView;
