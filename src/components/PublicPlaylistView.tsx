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
      const queryParams = new URLSearchParams({
        fields:
          "id,name,external_urls(spotify),owner(display_name,external_urls(spotify)),images(width,height,url),tracks(total)",
      });

      await callApi(`playlists/${playlistId}?${queryParams.toString()}`);
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
