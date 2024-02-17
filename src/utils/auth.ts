/** Dynamic URL of site from Vite base url */
const deployUrl = new URL(import.meta.url);

/** Generate nonce and redirect user to backend login endpoint to start Spotify auth process */
function initSpotifyLogin() {
  // Generate random 8-digit number
  const nonce = Math.floor(Math.random() * (99999999 - 10000000) + 10000000);

  // Store as cookie
  const nonceCookie = `exportify-nonce=${nonce}; Path=/api; SameSite=lax; Max-Age=300; Domain=${deployUrl.hostname}`;
  document.cookie = nonceCookie;

  // Redirect browser to /api/login to begin Spotify auth process
  window.location.assign(`${deployUrl.origin}/api/login`);
}

/** Checks cookies to confirm whether user has an access token */
function checkUserLoggedIn() {
  return document.cookie.includes("isLoggedIn");
}

export { initSpotifyLogin, checkUserLoggedIn };
