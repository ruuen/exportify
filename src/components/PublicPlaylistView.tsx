import { Playlist, SearchFormInputs } from "../types";
import SearchForm from "./SearchForm";
import PlaylistCard from "./PlaylistCard";
import useApiClient from "../hooks/useApiClient";
import { useCallback } from "react";

function PublicPlaylistView() {
  const {
    callApi,
    isLoading,
    data: playlist,
    errorState,
  } = useApiClient<Playlist>();

  const handlePlaylistSearch = useCallback(
    async (formData: SearchFormInputs) => {
      const queryParams = new URLSearchParams({
        playlistUrl: formData.playlistUrl,
      });

      await callApi(`getPlaylist?${queryParams.toString()}`);
    },
    []
  );

  return (
    <>
      <SearchForm
        handlePlaylistSearch={handlePlaylistSearch}
        isLoading={isLoading}
      />

      {playlist && (
        <PlaylistCard
          playlistId={playlist.id}
          errorState={errorState}
          title={playlist.name}
          author={playlist.owner.display_name}
          coverImages={playlist.images}
        />
      )}
    </>
  );
}

export default PublicPlaylistView;
