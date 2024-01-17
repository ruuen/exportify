import { AccessToken } from "../types";

/** Type thrown from operational errors during API calls */
class ApiError extends Error {}

/** Call proxy cloud func to retrieve a basic access token with no user permissions & only public playlist access */
/** A separate advanced auth func will handle the user auth mode with minimal read permissions using PKCE code auth method with Spotify API */
async function getBasicAccessToken(): Promise<AccessToken> {
  const response = await fetch("/api/basic");
  const data = await response.json();
  return data;
}

/** Fetch API wrapper for use in the useApiClient() custom hook */
async function querySpotifyAPI<T>(
  endpoint: string,
  accessToken: AccessToken,
  customOptions?: RequestInit
): Promise<T> {
  const baseUrl = "https://api.spotify.com";
  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.access_token}`,
    },
    ...customOptions,
  };

  const response = await fetch(new URL(`/v1/${endpoint}`, baseUrl), options);

  if (!response.ok) {
    const errorResponse = await response.text();
    return Promise.reject(new ApiError(errorResponse));
  }

  return await response.json();
}

/** Spotify playlists are queried based on their playlist ID, which needs to be split from the playlist URL's path */
function extractIdFromPlaylistURL(playlistURL: URL): string {
  const playlistId = playlistURL.pathname.split("/playlist/")[1];
  return playlistId;
}

export {
  ApiError,
  getBasicAccessToken,
  extractIdFromPlaylistURL,
  querySpotifyAPI,
};
