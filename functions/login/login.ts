import { Context } from "@netlify/functions";
import { randomBytes } from "crypto";
import { throwOperationalError } from "../utils";
import {
  DynamoDBClient,
  DynamoDBServiceException,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const DEPLOY_CONTEXT = Netlify.env.get("CONTEXT") || "";
const SPOTIFY_CLIENT_ID = Netlify.env.get("SPOTIFY_CLIENT_ID");
const DYNAMODB_ACCESS_KEY_ID = Netlify.env.get("DYNAMODB_ACCESS_KEY_ID") || "";
const DYNAMODB_ACCESS_KEY_SECRET =
  Netlify.env.get("DYNAMODB_ACCESS_KEY_SECRET") || "";
const DYNAMODB_TABLE_NAME =
  DEPLOY_CONTEXT === "production"
    ? "ExportifyStateToken"
    : "ExportifyDevStateToken";
const dbClient = new DynamoDBClient({
  region: DEPLOY_CONTEXT === "production" ? "us-east-2" : "ap-southeast-2",
  credentials: {
    accessKeyId: DYNAMODB_ACCESS_KEY_ID,
    secretAccessKey: DYNAMODB_ACCESS_KEY_SECRET,
  },
  maxAttempts: 5,
});
const docClient = DynamoDBDocumentClient.from(dbClient);

/** Receive nonce from cookie, generate state param for Spotify auth request, store in DynamoDb, return redirect to Spotify auth endpoint */
export default async (req: Request, context: Context) => {
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

  // Store nonce/state token pair in dynamodb
  // Reject request if it's an unrecoverable dyndb error
  try {
    const cmd = new PutCommand({
      TableName: DYNAMODB_TABLE_NAME,
      Item: {
        user_nonce: nonce,
        state_token: stateToken,
      },
    });
    const response = await docClient.send(cmd);
  } catch (error) {
    // AWS SDK exception doc: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html
    if (error instanceof DynamoDBServiceException) {
      return throwOperationalError(
        500,
        "Exportify had an issue generating your login request to Spotify.",
        `Call to dyndb from /api/login could not store nonce/token pair: ${error.name} ${error.message} (I'd bet it's the bloody ${error.$fault}'s fault...)`
      );
    } else {
      return throwOperationalError(
        500,
        "Exportify had an issue generating your login request to Spotify.",
        `Call to dyndb from /api/login could not store nonce/token pair: ${error}`
      );
    }
  }

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
