import { useCallback, useRef, useState } from "react";
import { PlaylistData, ResponseError } from "../types";
import { ApiError, queryBackend } from "../utils/queryBackend";
import useThrowAsyncError from "./useThrowAsyncError";

function useExporter(playlistId: string) {
  const playlistData = useRef<PlaylistData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<ResponseError | null>(null);

  const throwAsyncError = useThrowAsyncError();

  const getFullPlaylist = useCallback(async () => {
    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        playlistId: playlistId,
      });
      const response = await queryBackend<PlaylistData>(
        `getPlaylistTracks?${queryParams.toString()}`
      );
      playlistData.current = response;
      setIsLoading(false);
    } catch (error) {
      playlistData.current = null;
      setIsLoading(false);

      if (error instanceof ApiError) {
        setErrorState(JSON.parse(error.message));
      } else if (typeof error === "string") {
        throwAsyncError(new Error(error));
      } else {
        throwAsyncError(new Error("An unexpected error has occurred."));
      }
    }
  }, [playlistId]);

  return { getFullPlaylist, isLoading, errorState };
}

export default useExporter;
