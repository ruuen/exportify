/** Type thrown from operational errors during API calls */
class ApiError extends Error {}

/** Fetch wrapper for calling backend lambdas */
async function queryBackend<T>(
  endpoint: string,
  customOptions?: RequestInit
): Promise<T> {
  const baseUrl = "http://localhost:8888/api";
  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    ...customOptions,
  };

  const response = await fetch(`${baseUrl}/${endpoint}`, options);

  if (!response.ok) {
    const errorResponse = await response.text();
    return Promise.reject(new ApiError(errorResponse));
  }

  return await response.json();
}

export { ApiError, queryBackend };
