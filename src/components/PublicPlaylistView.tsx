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
    <div className="space-y-6 max-w-md mx-auto">
      <SearchForm
        handlePlaylistSearch={handlePlaylistSearch}
        isLoading={isLoading}
      />

      {playlist && (
        <PlaylistCard
          playlistId={playlist.id}
          playlistUrl={playlist.external_urls.spotify}
          errorState={errorState}
          title={playlist.name}
          author={playlist.owner}
          coverImages={playlist.images}
        />
      )}
    </div>
  );
}

export default PublicPlaylistView;
