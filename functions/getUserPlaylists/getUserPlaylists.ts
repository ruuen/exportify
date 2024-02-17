import { Context } from "@netlify/functions";
import { decryptToken, throwOperationalError } from "../utils";
import { PaginatedResponse, SpotifyAccessToken } from "../types";

interface PlaylistImage {
  width?: number;
  height?: number;
  url: string;
}

interface Playlist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
  owner: {
    display_name: string;
    external_urls: {
      spotify: string;
    };
  };
  images: Array<PlaylistImage>;
  tracks: {
    total: number;
  };
}

const CIPHER_KEY = Netlify.env.get("CIPHER_KEY");
const CIPHER_SALT = Netlify.env.get("CIPHER_SALT");

/**
 * Takes a user-scope token cookie, returns list containing all of user's saved playlists.
 */
export default async (req: Request, context: Context) => {
  // Reject request with server error if encryption key/salt can't be retrieved
  if (!CIPHER_KEY || !CIPHER_SALT) {
    return throwOperationalError(
      500,
      "Exportify had a problem while logging you into the Spotify API.",
      "Couldn't retrieve token encryption key details"
    );
  }

  const userTokenCookie = context.cookies.get("exportify-token");
  // Reject request if user token cookie wasn't provided. This endpoint needs a user-scoped token to return their playlists.
  if (!userTokenCookie) {
    return throwOperationalError(
      400,
      "This endpoint can't be used while you're not logged into Spotify via Exportify. Please log in with Spotify and try again."
    );
  }

  // Decrypt user's provided token cookie value and use this for our Spotify API request
  const spotifyAccessToken: SpotifyAccessToken = {
    access_token: "",
    token_type: "user",
  };
  try {
    const decryptedUserToken = await decryptToken(
      userTokenCookie,
      CIPHER_KEY,
      CIPHER_SALT
    );

    spotifyAccessToken.access_token = decryptedUserToken;
  } catch (error) {
    return throwOperationalError(
      500,
      "Exportify had a problem authenticating with Spotify to get a list of your playlists.",
      `Could not decrypt provided token cookie value during call to /api/getUserPlaylists: ${error}`
    );
  }

  // Initial filters for the Spotify API request. Subsequent requests made by following the next param will provide their own query params
  const queryParams = new URLSearchParams([
    [
      "fields",
      "total,limit,next,offset,items(id,name,external_urls(spotify),owner(display_name,external_urls(spotify)),images(width,height,url),tracks(total))",
    ],
    ["limit", "50"],
  ]);
  const ROOT_ENDPOINT = "https://api.spotify.com/v1/me/playlists";
  const initialEndpoint = `${ROOT_ENDPOINT}?${queryParams.toString()}`;
  const headers = new Headers({
    Authorization: `Bearer ${spotifyAccessToken.access_token}`,
    "Content-Type": "application/json",
  });

  // States for request paging
  const fullPlaylistList: Array<Playlist> = [];
  let isQueryComplete: boolean = false;
  let next: string | null = null;

  while (!isQueryComplete) {
    const response = await fetch(next || initialEndpoint, { headers: headers });
    const data: PaginatedResponse<Playlist> = await response.json();

    // If Spotify API didn't return a next URL value, we have no more data to query and should return to the user.
    if (!data.next) {
      fullPlaylistList.push(...data.items);
      isQueryComplete = true;
      break;
    }

    // Otherwise push the data we received in current query, and update next variable with next URL provided by Spotify API
    next = data.next;
    fullPlaylistList.push(...data.items);
  }

  return new Response(JSON.stringify(fullPlaylistList), {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
};
