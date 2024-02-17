import { Context } from "@netlify/functions";
import { getAccessToken, throwOperationalError } from "../utils";
import { SpotifyAccessToken } from "../types";
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

/** Take a Spotify playlist URL from query param, return playlist details from Spotify API */
export default async (req: Request, context: Context) => {
  const SPOTIFY_CLIENT_ID = Netlify.env.get("SPOTIFY_CLIENT_ID");
  const SPOTIFY_CLIENT_SECRET = Netlify.env.get("SPOTIFY_CLIENT_SECRET");

  // Reject request with server error if function can't retrieve Spotify API key environment vars
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return throwOperationalError(
      500,
      "Exportify had a problem while retrieving your playlist details",
      "Spotify API id or secret could not be loaded"
    );
  }

  const requestParams = new URL(req.url).searchParams;

  // Reject request with client error if there is no playlistUrl param
  const playlistUrl = requestParams.get("playlistUrl");
  if (!playlistUrl) {
    return throwOperationalError(
      400,
      "No query parameter called 'playlistUrl' was included with the request"
    );
  }

  // Reject request with client error if URL provided is not a valid Spotify playlist URL
  // eg. https://open.spotify.com/playlist/
  try {
    const requestUrl = new URL(playlistUrl);
    if (
      requestUrl.hostname !== "open.spotify.com" ||
      !requestUrl.pathname.startsWith("/playlist/")
    )
      throw new Error();
  } catch (error) {
    return throwOperationalError(
      400,
      "A valid Spotify playlist URL was not provided"
    );
  }

  // Get playlist ID from submitted URL for usage in Spotify API query
  const playlistId = extractIdFromPlaylistUrl(new URL(playlistUrl));

  // Query Spotify API for playlist information
  // Reject request with server error if non-operational errors occur during Spotify API calls
  try {
    // TODO: Implement caching to reduce access tokens being generated
    const basicAccessToken: SpotifyAccessToken = await getAccessToken(
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET
    );
    const fieldsToFetch = new URLSearchParams({
      fields:
        "id,name,external_urls(spotify),owner(display_name,external_urls(spotify)),images(width,height,url),tracks(total)",
    });
    const headers = new Headers({
      Authorization: `Bearer ${basicAccessToken.access_token}`,
      "Content-Type": "application/json",
    });
    const endpoint = `https://api.spotify.com/v1/playlists/${playlistId}?${fieldsToFetch.toString()}`;
    const response = await fetch(endpoint, {
      headers: headers,
    });

    // Reject request with server error if Spotify API response is a non-200 code
    if (!response.ok) {
      switch (response.status) {
        // Reject request with server error if Spotify access token was expired
        // TODO: Handle retry if access token expired
        case 401:
          return throwOperationalError(
            500,
            "Exportify could not retrieve playlist information from Spotify API. Please try again shortly.",
            "Basic access token expired during a request for playlist details."
          );
        // Reject request with server error if Spotify developer app is rate-limited
        // TODO: Handle retry if rate-limit in effect
        case 429:
          return throwOperationalError(
            500,
            "Too many people are using Exportify right now... please try again shortly. We're extremely sorry!",
            "Spotify developer app is rate-limited while a user is trying to retrieve playlist details."
          );
        // Reject request with client error if Spotify succeeded but couldn't find playlist with that ID
        case 404:
          return throwOperationalError(
            400,
            "Could not find a playlist matching your provided Spotify URL."
          );
        default:
          return throwOperationalError(
            500,
            "Exportify could not retrieve playlist information from Spotify API",
            `Spotify API playlist request failed with CODE ${response.status}: ${response.statusText}`
          );
      }
    }

    // Otherwise we're all golden and gucci to go ahead
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
    });
  } catch (error) {
    return throwOperationalError(
      500,
      "Exportify could not retrieve playlist information from Spotify API",
      `Request to Spotify API failed: ${error}`
    );
  }
};
