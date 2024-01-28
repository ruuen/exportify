import { useCallback, useState } from "react";
import { FileFormat, PlaylistData, ResponseError } from "../types";
import { ApiError, queryBackend } from "../utils/queryBackend";
import useThrowAsyncError from "./useThrowAsyncError";
import downloadFile from "../utils/downloadFile";

function useExporter(playlistId: string) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<ResponseError | null>(null);

  const throwAsyncError = useThrowAsyncError();

  const triggerExport = useCallback(
    async (fileFormat: FileFormat, fileName: string) => {
      setIsLoading(true);

      try {
        const queryParams = new URLSearchParams({
          playlistId: playlistId,
        });
        const response = await queryBackend<PlaylistData>(
          `getPlaylistTracks?${queryParams.toString()}`
        );
        downloadFile(response, fileFormat, fileName);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);

        if (error instanceof ApiError) {
          setErrorState(JSON.parse(error.message));
        } else if (typeof error === "string") {
          throwAsyncError(new Error(error));
        } else {
          throwAsyncError(new Error("An unexpected error has occurred."));
        }
      }
    },
    [playlistId]
  );

  return { triggerExport, isLoading, errorState };
}

export default useExporter;
