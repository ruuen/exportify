import { Playlist, SearchFormInputs } from "../types";
import SearchForm from "./SearchForm";
import PlaylistCard from "./PlaylistCard";
import useApiClient from "../hooks/useApiClient";
import { useCallback } from "react";
import { extractIdFromPlaylistURL } from "../utils/SpotifyUtils";

function PublicPlaylistView() {
  const [callApi, isLoading, playlist, errorState] = useApiClient<Playlist>();

  const handlePlaylistSearch = useCallback(
    async (formData: SearchFormInputs) => {
      const playlistId = extractIdFromPlaylistURL(
        new URL(formData.playlistUrl)
      );
      await callApi(`playlists/${playlistId}`);
    },
    []
  );

  return (
    <>
      {/* TODO: isLoading passed as prop to SearchForm, loader displayed within form submit btn */}
      <SearchForm handlePlaylistSearch={handlePlaylistSearch} />
      {isLoading && <span>This is a test loading message...</span>}
      {playlist && (
        <PlaylistCard
          errorState={errorState}
          title={playlist.name}
          author={playlist.owner.display_name}
          coverImage="https://images.unsplash.com/photo-1703401895640-bf1b9f6c803e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcwNTIxMzQ1MA&ixlib=rb-4.0.3&q=80&w=300"
        />
      )}
    </>
  );
}

export default PublicPlaylistView;
