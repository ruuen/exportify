import { useCallback, useState } from "react";
import { ResponseError } from "../types";
import { ApiError, queryBackend } from "../utils/queryBackend";
import useThrowAsyncError from "./useThrowAsyncError";

function useApiClient<T>(): {
  callApi: (endpoint: string, customOptions?: RequestInit) => Promise<void>;
  isLoading: boolean;
  data: T | null;
  errorState: ResponseError | null;
} {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<T | null>(null);
  const [errorState, setErrorState] = useState<ResponseError | null>(null);

  const throwAsyncError = useThrowAsyncError();

  const callApi = useCallback(
    async (targetEndpoint: string, customOptions?: RequestInit) => {
      setIsLoading(true);

      try {
        const response = await queryBackend<T>(targetEndpoint, customOptions);

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
    },
    []
  );

  return { callApi, isLoading, data, errorState };
}

export default useApiClient;
