import { Context } from "@netlify/functions";
import { getAccessToken, throwOperationalError, decryptToken } from "../utils";
import { PaginatedResponse, SpotifyAccessToken } from "../types";

interface Track {
  name: string;
  album: {
    name: string;
  };
  artists: [
    {
      name: string;
    }
  ];
}

const CIPHER_KEY = Netlify.env.get("CIPHER_KEY");
const CIPHER_SALT = Netlify.env.get("CIPHER_SALT");
const SPOTIFY_CLIENT_ID = Netlify.env.get("SPOTIFY_CLIENT_ID");
const SPOTIFY_CLIENT_SECRET = Netlify.env.get("SPOTIFY_CLIENT_SECRET");

/**
 * Takes a Spotify playlist ID, returns all playlist tracks within a playlist item from Spotify API.
 *
 * Uses basic-scope auth if no token cookie provided, otherwise the token cookie value is decrypted and used for user-scope auth.
 */
export default async (req: Request, context: Context) => {
  // Reject request with server error if function can't retrieve Spotify API key environment vars
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return throwOperationalError(
      500,
      "Exportify had a problem while retrieving your playlist details",
      "Spotify API id or secret could not be loaded"
    );
  }

  // Reject request with server error if encryption key/salt can't be retrieved
  if (!CIPHER_KEY || !CIPHER_SALT) {
    return throwOperationalError(
      500,
      "Exportify had a problem while logging you into the Spotify API.",
      "Couldn't retrieve token encryption key details"
    );
  }

  // Reject request with client error if there was no playlistId param
  const requestParams = new URL(req.url).searchParams;
  const playlistId = requestParams.get("playlistId");
  if (!playlistId) {
    return throwOperationalError(
      400,
      "No Spotify playlist id was provided as a query param"
    );
  }

  const spotifyAccessToken: SpotifyAccessToken = {
    access_token: "",
    // TODO: I think my need for the token_type field has gone out the window since I've improved the flow; it can honestly be removed.
    token_type: "",
  };
  // Get user-scope token from cookie if provided
  const userTokenCookie = context.cookies.get("exportify-token");

  // Generate and use a basic-scope token if user didn't provide token cookie
  // Otherwise decrypt the user's provided token cookie value and use this as the access token
  try {
    if (!userTokenCookie) {
      const basicAccessToken: SpotifyAccessToken = await getAccessToken(
        SPOTIFY_CLIENT_ID,
        SPOTIFY_CLIENT_SECRET
      );
      spotifyAccessToken.access_token = basicAccessToken.access_token;
      spotifyAccessToken.token_type = basicAccessToken.token_type;
    } else {
      const decryptedUserToken = await decryptToken(
        userTokenCookie,
        CIPHER_KEY,
        CIPHER_SALT
      );
      spotifyAccessToken.access_token = decryptedUserToken;
      spotifyAccessToken.token_type = "user";
    }
  } catch (error) {
    return throwOperationalError(
      500,
      "Exportify had an issue getting your playlist track details. Please try again shortly.",
      `Error generating or parsing Spotify API token to use in /api/getPlaylistTracks call: ${error}`
    );
  }

  // Initial filters for the Spotify API request. Subsequent requests made by following the next param will provide their own query params
  const queryParams = new URLSearchParams([
    [
      "fields",
      "total,limit,next,offset,items(track(name,artists(name),album.name))",
    ],
    ["limit", "100"],
  ]);
  const ROOT_ENDPOINT = "https://api.spotify.com/v1/playlists";
  const initialEndpoint = `${ROOT_ENDPOINT}/${playlistId}/tracks?${queryParams.toString()}`;
  const headers = new Headers({
    Authorization: `Bearer ${spotifyAccessToken.access_token}`,
    "Content-Type": "application/json",
  });

  // States for request paging
  const fullTrackList: Array<Track> = [];
  let isQueryComplete: boolean = false;
  let next: string | null = null;

  while (!isQueryComplete) {
    const response = await fetch(next || initialEndpoint, { headers: headers });
    const data: PaginatedResponse<Track> = await response.json();

    // If Spotify API didn't return a next URL value, we have no more data to query and should return to the user.
    if (!data.next) {
      fullTrackList.push(...data.items);
      isQueryComplete = true;
      break;
    }

    // Otherwise push the data we received in current query, and update next variable with next URL provided by Spotify API
    next = data.next;
    fullTrackList.push(...data.items);
  }

  return new Response(JSON.stringify(fullTrackList), {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
};
