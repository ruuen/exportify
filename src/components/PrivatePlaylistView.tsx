import PlaylistCard from "./PlaylistCard";
import useApiClient from "../hooks/useApiClient";
import { useEffect } from "react";
import useThrowAsyncError from "../hooks/useThrowAsyncError";
import { Playlist } from "../types";
import LoadingSpinner from "./LoadingSpinner";

function PrivatePlaylistView() {
  const {
    callApi,
    isLoading,
    data: playlists,
    errorState,
  } = useApiClient<Array<Playlist>>();
  const throwAsyncError = useThrowAsyncError();

  const playlistElements = playlists?.map((playlist, index) => {
    return (
      <li key={index + 1}>
        <PlaylistCard
          playlistId={playlist.id}
          playlistUrl={playlist.external_urls.spotify}
          coverImages={playlist.images}
          title={playlist.name}
          author={playlist.owner}
          errorState={null}
        />
      </li>
    );
  });

  useEffect(() => {
    const fetchData = async () => await callApi("getUserPlaylists");
    fetchData().catch((err) => throwAsyncError(err));
  }, []);

  return (
    <>
      {isLoading && (
        <div className="mx-auto">
          <LoadingSpinner />
        </div>
      )}
      {errorState && !isLoading && (
        <div className="mx-auto">
          <p>
            Unable to fetch your playlists from Spotify API. Please try again.
          </p>
        </div>
      )}
      {playlistElements && !isLoading && (
        <ul className="space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:grid-flow-row md:auto-rows-min md:gap-5 lg:grid-cols-3">
          {playlistElements}
        </ul>
      )}
    </>
  );
}

export default PrivatePlaylistView;
