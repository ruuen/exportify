import { Context } from "@netlify/functions";
import { throwOperationalError } from "../utils";

const SPOTIFY_CLIENT_ID = Netlify.env.get("SPOTIFY_CLIENT_ID");
const SPOTIFY_CLIENT_SECRET = Netlify.env.get("SPOTIFY_CLIENT_SECRET");

export default (req: Request, context: Context) => {
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
    return throwOperationalError(400, "Bad request");
  }

  // If code or state params not defined, return client error
  const requestParams = new URL(req.url).searchParams;
  const code = requestParams.get("code");
  const stateToken = requestParams.get("state");
  if (!code || !stateToken) {
    return throwOperationalError(400, "Bad request");
  }

  // Select nonce & state token from dynamodb
  // If stored state token for nonce key doesn't match state param and nonce cookie, return client error
  // TODO: Implement this

  // Retrieve access token from Spotify API

  // Return access token as httpOnly cookie, return logged in state, delete nonce cookie from browser
  return new Response(null, {
    status: 302,
    headers: new Headers([
      ["Location", "http://localhost:8888/"],
      [
        "Set-Cookie",
        "exportify-nonce=null; Path=/api; Max-Age=0; SameSite=lax; Domain=localhost;",
      ],
      [
        "Set-Cookie",
        "isLoggedIn=true; Path=/; Max-Age=3600; SameSite=strict; Domain=localhost;",
      ],
    ]),
  });
};
