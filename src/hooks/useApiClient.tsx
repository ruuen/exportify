import { useCallback, useEffect, useState } from "react";
import { AccessToken, ResponseError } from "../types";
import {
  ApiError,
  getBasicAccessToken,
  querySpotifyAPI,
} from "../utils/SpotifyUtils";
import useThrowAsyncError from "./useThrowAsyncError";

function useApiClient<T>(
  endpoint?: string
): [
  callApi: (endpoint: string) => Promise<void>,
  isLoading: boolean,
  data: T | null,
  errorState: ResponseError | null
] {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<T | null>(null);
  const [errorState, setErrorState] = useState<ResponseError | null>(null);

  const throwAsyncError = useThrowAsyncError();

  const callApi = useCallback(async (targetEndpoint: string) => {
    setIsLoading(true);
    const accessToken: AccessToken = await getBasicAccessToken();
    try {
      const response = await querySpotifyAPI<T>(targetEndpoint, accessToken);
      setData(response);
      setErrorState(null);
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
  }, []);

  useEffect(() => {
    if (typeof endpoint === "undefined" || endpoint === "") return;

    callApi(endpoint);
  }, [endpoint]);

  return [callApi, isLoading, data, errorState];
}

export default useApiClient;
