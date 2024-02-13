import { SpotifyAccessToken } from "./types";

/**
 * Obtain a basic or user-scoped Spotify access token from the Spotify API.
 *
 * Basic request doc: https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
 *
 * User-scoped request doc: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 * @param spotifyClientId Spotify client ID of a Spotify Developer app.
 * @param spotifyClientSecret Spotify client secret of a Spotify Developer app.
 * @param tokenType Permission scope of the token; either "basic" or "user". Defaults to "basic".
 * @param code If "user" scope specified, auth code from Spotify needs to be provided to receive access token.
 * @param redirectUri If "user" scope specified, you need to provide the redirect uri value used during auth code generation for access token generation.
 * @returns A Spotify access token object which can be used to make requests to regular Spotify API endpoints.
 */
async function getAccessToken(
  spotifyClientId: string,
  spotifyClientSecret: string,
  tokenType: "basic" | "user" = "basic",
  code?: string,
  redirectUri?: string
): Promise<SpotifyAccessToken> {
  const tokenEndpoint = "https://accounts.spotify.com/api/token";
  const encodedAuthString = Buffer.from(
    `${spotifyClientId}:${spotifyClientSecret}`
  ).toString("base64");

  const headers = new Headers({
    Authorization: `Basic ${encodedAuthString}`,
    "Content-Type": "application/x-www-form-urlencoded",
  });

  // If user-scope mode being used, access token request body needs a "code" & "redirect_uri" param value
  const body = new URLSearchParams({
    grant_type:
      tokenType === "user" ? "authorization_code" : "client_credentials",
    // As much as I love this spreading trick to conditionally add params to an object, it feels wrong?
    ...(tokenType === "user" && { code: code }),
    ...(tokenType === "user" && { redirect_uri: redirectUri }),
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

  const tokenResponseData = await response.json();
  const accessToken: SpotifyAccessToken = {
    access_token: tokenResponseData.access_token,
    token_type: tokenType,
  };

  return accessToken;
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
  return new Response(
    JSON.stringify({
      message: clientMessage,
    }),
    {
      status: httpCode,
      headers: new Headers({ "Content-Type": "application/json" }),
    }
  );
}

export { getAccessToken, throwOperationalError };
