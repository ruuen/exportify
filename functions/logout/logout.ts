import { Context } from "@netlify/functions";
import { throwOperationalError } from "../utils";

/** Return cookie headers to remove Spotify access token and logged in state cookies from user's session */
export default (req: Request, context: Context) => {
  try {
    // Deploy url provided by function context param
    if (!context.site.url) throw new Error("Site url not provided in context");
    const deployUrl = new URL(context.site.url);

    return new Response(null, {
      status: 302,
      headers: new Headers([
        ["Location", deployUrl.toString()],
        [
          "Set-Cookie",
          `exportify-token=null; Domain=${deployUrl.hostname}; Path=/api; Max-Age=0; SameSite=strict;`,
        ],
        [
          "Set-Cookie",
          `isLoggedIn=false; Domain=${deployUrl.hostname}; Path=/; Max-Age=0; SameSite=strict;`,
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
