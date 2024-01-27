import { BasicAccessToken } from "./types";

/**
 * Obtain a basic Spotify access token from the Spotify API.
 *
 * https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
 * @param spotifyClientId Spotify client ID of a Spotify Developer app.
 * @param spotifyClientSecret Spotify client secret of a Spotify Developer app.
 * @returns An access token with public-level permissions.
 */
async function getBasicAccessToken(
  spotifyClientId: string,
  spotifyClientSecret: string
): Promise<BasicAccessToken> {
  const tokenEndpoint = "https://accounts.spotify.com/api/token";
  const encodedAuthString = Buffer.from(
    `${spotifyClientId}:${spotifyClientSecret}`
  ).toString("base64");

  const headers = new Headers({
    Authorization: `Basic ${encodedAuthString}`,
    "Content-Type": "application/x-www-form-urlencoded",
  });
  const body = new URLSearchParams({
    grant_type: "client_credentials",
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: headers,
    body: body,
  });

  if (!response.ok) {
    // Send error to function log
    console.log(
      `Spotify API basic auth request failed with CODE ${response.status}: ${response.statusText}`
    );
    throw new Error("Not able to return auth token from Spotify API");
  }

  return await response.json();
}

/**
 * Spotify playlists are queried based on their playlist ID, which needs to be split from the playlist URL's path.
 *
 * @param playlistUrl Full Spotify playlist URL, generated from sharing the playlist and copying the link.
 * @returns String of a Spotify playlist ID.
 */
function extractIdFromPlaylistUrl(playlistUrl: URL): string {
  const playlistId = playlistUrl.pathname.split("/playlist/")[1];
  return playlistId;
}

/**
 * Helper for returning an error response to client from lambda func.
 *
 * Optionally logs a message to the lambda func's logs if serverMessage param is specified.
 * @param httpCode
 * @param clientMessage
 * @param serverMessage
 * @returns A Response object with the defined status code and an error message within the response body.
 */
function throwOperationalError(
  httpCode: number,
  clientMessage: string,
  serverMessage?: string
): Response {
  // Log detailed error to Netlify function console for debugging
  if (serverMessage) console.log(serverMessage);

  // Return simple error to client
  return new Response(JSON.stringify(clientMessage), {
    status: httpCode,
  });
}

export { getBasicAccessToken, extractIdFromPlaylistUrl, throwOperationalError };
