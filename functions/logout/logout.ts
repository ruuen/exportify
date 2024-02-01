import { Context } from "@netlify/functions";

/** Return cookie headers to remove Spotify access token and logged in state cookies from user's session */
export default (req: Request, context: Context) => {
  return new Response(null, {
    status: 302,
    headers: new Headers([
      // TODO: load domain based on deploy context
      ["Location", "http://localhost:8888"],
      [
        "Set-Cookie",
        "exportify-token=null; Domain=localhost; Path=/api; Max-Age=0; SameSite=strict;",
      ],
      [
        "Set-Cookie",
        "isLoggedIn=false; Domain=localhost; Path=/; Max-Age=0; SameSite=strict;",
      ],
    ]),
  });
};
