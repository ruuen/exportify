import { Context } from "@netlify/functions";
import { randomBytes } from "crypto";
import { throwOperationalError } from "../utils";

const SPOTIFY_CLIENT_ID = Netlify.env.get("SPOTIFY_CLIENT_ID");

/** Receive nonce from cookie, generate state param for Spotify auth request, store in DynamoDb, return redirect to Spotify auth endpoint */
export default (req: Request, context: Context) => {
  // If no Spotify API credentials provided as env var, return server error
  if (!SPOTIFY_CLIENT_ID) {
    return throwOperationalError(
      500,
      "Exportify had an issue generating your login request to Spotify.",
      "No Spotify API credentials provided as env var to /api/login function."
    );
  }

  // If nonce not provided as cookie, return client error
  const nonce = context.cookies.get("exportify-nonce");
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
  try {
    // Deploy url provided by function context param
    if (!context.site.url) throw new Error("Site url not provided in context");
    const deployUrl = new URL(context.site.url);

    const responseParams = new URLSearchParams([
      ["response_type", "code"],
      ["client_id", SPOTIFY_CLIENT_ID],
      ["scope", spotifyAccessScope],
      ["redirect_uri", `${deployUrl.toString()}api/auth`],
      ["state", stateToken],
    ]);

    return new Response(null, {
      status: 302,
      headers: {
        Location: `https://accounts.spotify.com/authorize?${responseParams.toString()}`,
      },
    });
  } catch (error) {
    return throwOperationalError(
      500,
      "Exportify had a problem during the Spotify login process",
      `Could not build function response param object: ${error}`
    );
  }
};
