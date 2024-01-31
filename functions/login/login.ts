import { Context } from "@netlify/functions";
import { randomBytes } from "crypto";
import { throwOperationalError } from "../utils";

const SPOTIFY_CLIENT_ID = Netlify.env.get("SPOTIFY_CLIENT_ID");

/** Receive nonce from param, generate state param for Spotify auth request, store in DynamoDb, return redirect to Spotify auth endpoint */
export default (req: Request, context: Context) => {
  // If no Spotify API credentials provided as env var, return server error
  if (!SPOTIFY_CLIENT_ID) {
    return throwOperationalError(
      500,
      "Exportify had an issue generating your login request to Spotify.",
      "No Spotify API credentials provided as env var to /api/login function."
    );
  }

  // If nonce not provided as request param, return client error
  const requestParams = new URL(req.url).searchParams;
  const nonce = requestParams.get("nonce");
  if (!nonce) {
    return throwOperationalError(400, "Bad request");
  }

  // Generate a random 16-char string as state token
  const stateToken = randomBytes(8).toString("hex");

  // Store state token in dynamodb with nonce as key
  // TODO: implement this

  // Define required user permissions needed for the Spotify access token
  // Exportify only needs ability to read private playlists so it can retrieve a list of the user's playlists, and retrieve the items within a private playlist for the user's export.
  const spotifyAccessScope = "playlist-read-private";

  // Return redirect as response
  const responseParams = new URLSearchParams([
    ["response_type", "code"],
    ["client_id", SPOTIFY_CLIENT_ID],
    ["scope", spotifyAccessScope],
    // TODO: dynamically get this URL from netlify context obj based on deploy context
    ["redirect_uri", "http://localhost:8888/api/auth"],
    ["state", stateToken],
  ]);

  return new Response(null, {
    status: 301,
    headers: {
      Location: `https://accounts.spotify.com/authorize?${responseParams.toString()}`,
    },
  });
};
