import { Context } from "@netlify/functions";

/** Obtain a basic Spotify access token from the Spotify API & return this to the user */
export default async (req: Request, context: Context) => {
  // Make token request to Spotify API using client credentials flow
  // https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
  const tokenRequestUrl = "https://accounts.spotify.com/api/token";
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
  const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const encodedAuthString = Buffer.from(
    `${spotifyClientId}:${spotifyClientSecret}`
  ).toString("base64");

  const headers = new Headers({
    Authorization: `Basic ${encodedAuthString}`,
    "Content-Type": "application/x-www-form-urlencoded",
  });
  const body = new URLSearchParams({ grant_type: "client_credentials" });

  const response = await fetch(tokenRequestUrl, {
    method: "POST",
    headers: headers,
    body: body,
  });

  // If Spotify API returned any error, print this to my function log and return a 500 error message to the requester
  if (!response.ok) {
    console.log(
      `Error requesting Spotify API token: Request to ${response.url} failed with code ${response.status}: ${response.statusText}`
    );

    const errorResponseOptions = {
      status: 500,
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    };

    if (response.status >= 500) {
      return new Response(
        JSON.stringify(
          "An error occurred with the Spotify API, but Exportify appears to be working fine. Please try again shortly and it may be resolved."
        ),
        errorResponseOptions
      );
    }
    if (response.status >= 400 && response.status < 500) {
      return new Response(
        JSON.stringify(
          "An error occurred while Exportify was attempting communication with the Spotify API. It's not you, it's us..."
        ),
        errorResponseOptions
      );
    }
  }

  // Otherwise, parse response data to JSON and return a 200 response to the requester
  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
};
