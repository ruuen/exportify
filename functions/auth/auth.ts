import { Context } from "@netlify/functions";
import { getAccessToken, throwOperationalError } from "../utils";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { SpotifyAccessToken } from "../types";

const SPOTIFY_CLIENT_ID = Netlify.env.get("SPOTIFY_CLIENT_ID");
const SPOTIFY_CLIENT_SECRET = Netlify.env.get("SPOTIFY_CLIENT_SECRET");
const DYNAMODB_ACCESS_KEY_ID = Netlify.env.get("DYNAMODB_ACCESS_KEY_ID") || "";
const DYNAMODB_ACCESS_KEY_SECRET =
  Netlify.env.get("DYNAMODB_ACCESS_KEY_SECRET") || "";
const dbClient = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: DYNAMODB_ACCESS_KEY_ID,
    secretAccessKey: DYNAMODB_ACCESS_KEY_SECRET,
  },
});
const docClient = DynamoDBDocumentClient.from(dbClient);

export default async (req: Request, context: Context) => {
  // Reject request with server error if function can't retrieve Spotify API key environment vars
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return throwOperationalError(
      500,
      "Exportify had a problem while retrieving your playlist details",
      "Spotify API id or secret could not be loaded"
    );
  }

  // If nonce not provided as cookie, return client error
  const nonce = context.cookies.get("exportify-nonce");
  if (!nonce) {
    return throwOperationalError(
      400,
      "Bad request",
      // I probably need to be aware of this happening frequently, so sending to function logs
      "A request was made to the auth endpoint without a nonce cookie"
    );
  }

  // If code or state params not defined, return client error
  const requestParams = new URL(req.url).searchParams;
  const code = requestParams.get("code");
  const stateToken = requestParams.get("state");
  if (!code || !stateToken) {
    return throwOperationalError(
      400,
      "Bad request",
      // I probably need to be aware of this happening frequently, so sending to function logs
      "A request was made to the auth endpoint without a code or state token"
    );
  }

  // Select nonce/state pair from dynamodb based on request values
  // Reject auth if no matching pair found
  try {
    const tableName = "ExportifyStateToken";
    const getTokenCommand = new GetCommand({
      TableName: tableName,
      Key: {
        user_nonce: nonce,
        state_token: stateToken,
      },
    });
    const tokenResponse = await docClient.send(getTokenCommand);

    // If query rejected due to an error, return server error
    if (tokenResponse.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Could not get token from dynamodb: ${JSON.stringify(
          tokenResponse.$metadata
        )}`
      );
    }

    // TODO: handle dyndb timeout if throttled

    // If no item returned from dynamodb, the nonce/token pair provided in request is wrong, return client error
    if (!tokenResponse.Item) {
      return throwOperationalError(
        400,
        "Bad request",
        // I probably need to be aware of this happening frequently, so sending to function logs
        `A state token couldn't be found for pair "${nonce}:${stateToken}"`
      );
    }

    // Token in db is no longer required
    const deleteTokenCommand = new DeleteCommand({
      TableName: tableName,
      Key: {
        user_nonce: nonce,
        state_token: stateToken,
      },
    });
    const deleteTokenResponse = await docClient.send(deleteTokenCommand);
    if (deleteTokenResponse.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Could not delete token from dynamodb: ${JSON.stringify(
          deleteTokenResponse.$metadata
        )}`
      );
    }
  } catch (error) {
    return throwOperationalError(
      500,
      "Exportify had an issue during your login request to Spotify.",
      `Error during authentication process: ${error}`
    );
  }

  // Parse deploy url provided by function context param, reject if not provided/invalid
  let deployUrl: URL;
  try {
    if (!context.site.url) throw new Error("Site url not provided in context");
    deployUrl = new URL(context.site.url);
  } catch (error) {
    return throwOperationalError(
      500,
      "Exportify had a problem during the Spotify login process",
      `Could not retrieve domain from site url in current request context: ${error}`
    );
  }

  // Retrieve access token from Spotify API
  let spotifyAccessToken: string;
  try {
    const accessTokenResponse = await getAccessToken(
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      "user",
      code,
      `${deployUrl.toString()}api/auth`
    );

    // TODO: Going to encrypt this token string
    spotifyAccessToken = accessTokenResponse.access_token;
  } catch (error) {
    return throwOperationalError(
      500,
      "Exportify had a problem during the Spotify login process",
      `Could not retrieve user-scoped access token from Spotify API: ${error}`
    );
  }

  // Return access token as httpOnly cookie, return logged in state, delete nonce cookie from browser
  try {
    return new Response(null, {
      status: 302,
      headers: new Headers([
        ["Location", deployUrl.toString()],
        [
          "Set-Cookie",
          `exportify-token=${spotifyAccessToken}; Domain=${deployUrl.hostname}; Path=/api; Max-Age=3600; SameSite=strict; HttpOnly;`,
        ],
        [
          "Set-Cookie",
          `isLoggedIn=true; Path=/; Max-Age=3600; SameSite=strict; Domain=${deployUrl.hostname};`,
        ],
        [
          "Set-Cookie",
          `exportify-nonce=null; Path=/api; Max-Age=0; SameSite=lax; Domain=${deployUrl.hostname};`,
        ],
      ]),
    });
  } catch (error) {
    return throwOperationalError(
      500,
      "Exportify had a problem during the Spotify login process",
      `Could not retrieve domain from site url in current request context: ${error}`
    );
  }
};
