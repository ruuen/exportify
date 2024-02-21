import { Context } from "@netlify/functions";
import { getAccessToken, throwOperationalError, decryptToken } from "../utils";
import {
  PagedApiResponse,
  PagedSpotifyResponse,
  SpotifyAccessToken,
} from "../types";

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

  // Get request params
  const requestParams = new URL(req.url).searchParams;
  // TODO: validate that this is a valid number
  // TODO: Reject request with client error if offset param value is not a positive int
  const offset = requestParams.get("offset");
  const playlistId = requestParams.get("playlistId");
  // Reject request with client error if there was no playlistId param
  if (!playlistId) {
    return throwOperationalError(
      400,
      "No Spotify playlist id was provided as a query param"
    );
  }

  // Timestamp beginning of main function work
  // If we haven't naturally completed the Spotify API loop by this time, we need to return a partial response
  // TODO: Tune this timeout value; I think it could end up around 6ish seconds
  // TODO: This is currently set to 1 second so I can trigger easily
  const functionExpiryTime = Date.now() + 1 * 1000;

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
  // If an "offset" param was provided, this will be used in the first Spotify API request in loop.
  const queryParams = new URLSearchParams([
    [
      "fields",
      "total,limit,next,offset,items(track(name,artists(name),album.name))",
    ],
    ["limit", "100"],
    ["offset", offset ? `${offset}` : "0"],
  ]);
  const ROOT_ENDPOINT = "https://api.spotify.com/v1/playlists";
  const initialEndpoint = `${ROOT_ENDPOINT}/${playlistId}/tracks?${queryParams.toString()}`;
  const headers = new Headers({
    Authorization: `Bearer ${spotifyAccessToken.access_token}`,
    "Content-Type": "application/json",
  });

  // States for request paging
  const finalResponse: PagedApiResponse<Track> = {
    items: [],
  };
  let isQueryComplete: boolean = false;
  let nextSpotifyPage: string | null = null;

  while (!isQueryComplete) {
    // Return partial response if this loop iteration will occur past our function expiry timestamp
    const willFunctionTimeout = Date.now() > functionExpiryTime;
    if (willFunctionTimeout) {
      // Parse deploy url provided by function context param, reject if not provided/invalid
      let deployUrl: URL;
      try {
        if (!context.site.url)
          throw new Error("Site url not provided in context");
        deployUrl = new URL(context.site.url);
      } catch (error) {
        return throwOperationalError(
          500,
          "Exportify had a problem during the Spotify login process",
          `Could not retrieve domain from site url in current request context: ${error}`
        );
      }

      // calc offset value
      // if our Spotify API loop started with a given offset value, add this to the count of processed items in our subsequent request
      // otherwise we only need to return the count of items processed as this was an initial request
      const nextOffset = offset
        ? Number(offset) + finalResponse.items.length
        : finalResponse.items.length;

      // construct "next" url for client to follow
      const offsetParam = new URLSearchParams({
        offset: `${nextOffset}`,
      });
      const nextUrl = `${
        deployUrl.origin
      }/api/getPlaylistTracks?${offsetParam.toString()}`;

      // return partial response with url to next page
      finalResponse.next = nextUrl;
      isQueryComplete = true;
      break;
    }

    // Make Spotify API call
    const response = await fetch(nextSpotifyPage || initialEndpoint, {
      headers: headers,
    });
    const data: PagedSpotifyResponse<Track> = await response.json();

    // If Spotify API didn't return a next URL value, we have no more data to query and should return to the user.
    if (!data.next) {
      finalResponse.items.push(...data.items);
      isQueryComplete = true;
      break;
    }

    // Otherwise push the data we received in current query, and update next variable with next URL provided by Spotify API
    nextSpotifyPage = data.next;
    finalResponse.items.push(...data.items);
  }

  return new Response(JSON.stringify(finalResponse), {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
};
