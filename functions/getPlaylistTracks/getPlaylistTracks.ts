import { Context } from "@netlify/functions";
import { getBasicAccessToken, throwOperationalError } from "../utils";
import { BasicAccessToken } from "../types";

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

interface PlaylistData {
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  items: Array<Track>;
}

export default async (req: Request, context: Context) => {
  const SPOTIFY_CLIENT_ID = Netlify.env.get("SPOTIFY_CLIENT_ID");
  const SPOTIFY_CLIENT_SECRET = Netlify.env.get("SPOTIFY_CLIENT_SECRET");
  const ROOT_ENDPOINT = "https://api.spotify.com/v1/playlists";

  // Reject request with server error if function can't retrieve Spotify API key environment vars
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return throwOperationalError(
      500,
      "Exportify had a problem while retrieving your playlist details",
      "Spotify API id or secret could not be loaded"
    );
  }

  const requestParams = new URL(req.url).searchParams;

  // Reject request with client error if there was no playlistId param
  const playlistId = requestParams.get("playlistId");
  if (!playlistId) {
    throwOperationalError(
      400,
      "No Spotify playlist id was provided as a query param"
    );
  }

  const accessToken: BasicAccessToken = await getBasicAccessToken(
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET
  );
  const queryParams = new URLSearchParams([
    [
      "fields",
      "total,limit,next,offset,items(track(name,artists(name),album.name))",
    ],
    ["limit", "100"],
  ]);
  const initialEndpoint = `${ROOT_ENDPOINT}/${playlistId}/tracks?${queryParams.toString()}`;
  const headers = new Headers({
    Authorization: `Bearer ${accessToken.access_token}`,
    "Content-Type": "application/json",
  });

  const fullTrackList: Array<Track> = [];
  let isQueryComplete: boolean = false;
  let next: string | null = null;

  while (!isQueryComplete) {
    const response = await fetch(next || initialEndpoint, { headers: headers });
    const data: PlaylistData = await response.json();

    console.log("QUERY MADE:");

    if (!data.next) {
      console.log("NO FURTHER DATA. RETURNING ALL.");
      fullTrackList.push(...data.items);
      isQueryComplete = true;
      continue;
    }

    console.log("MORE DATA TO GO. NEXT QUERY SHOULD OCCUR");
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
