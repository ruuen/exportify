import { useCallback, useState } from "react";
import {
  FileFormat,
  PagedApiResponse,
  PlaylistData,
  ResponseError,
} from "../types";
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

      // Call backend for playlist items, follow next pages to completion if partial responses are returned due to timeout
      const finalData: PagedApiResponse<PlaylistData> = {
        items: [],
      };
      let isQueryComplete: boolean = false;
      let nextPage: string | null = null;

      while (!isQueryComplete) {
        try {
          const queryParams = new URLSearchParams({
            playlistId: playlistId,
          });
          const response: PagedApiResponse<PlaylistData> = await queryBackend<
            PagedApiResponse<PlaylistData>
          >(nextPage || `getPlaylistTracks?${queryParams.toString()}`);

          // If backend returned no next page to follow, we now have the full playlist and can kill the loop
          if (!response.next) {
            finalData.items.push(...response.items);
            isQueryComplete = true;
            break;
          }

          // Otherwise we need to store the next page URL for usage in next loop iteration
          finalData.items.push(...response.items);
          nextPage = response.next;
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
      }

      // Trigger file download only when we have all the data for that playlist available
      downloadFile(finalData.items, fileFormat, fileName);
      setIsLoading(false);
    },
    [playlistId]
  );

  return { triggerExport, isLoading, errorState };
}

export default useExporter;
