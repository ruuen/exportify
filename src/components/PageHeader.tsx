import { initSpotifyLogin } from "../utils/auth";
import Button from "./Button";
import ButtonLink from "./ButtonLink";

interface PageHeaderProps {
  isLoggedIn: boolean;
}

function PageHeader({ isLoggedIn }: PageHeaderProps) {
  return (
    <header className="space-y-5 mx-auto lg:flex lg:space-y-0 lg:max-w-6xl">
      <div className="space-y-4">
        <h1 className="font-semibold text-4xl text-slate-100">Exportify</h1>
        <h2 className="text-xl">
          Export public & private Spotify playlists to a CSV or JSON file
          download.
        </h2>
        <div className="space-y-3">
          <p>
            Public playlists can be exported using their URL without logging in
            to Spotify.
          </p>
          <p>
            Your own private and saved/shared playlists will be available by
            signing in.
          </p>
          <p>
            Made by&nbsp;
            <a
              href="#"
              className="underline underline-offset-2 hover:text-slate-100 transition-colors"
            >
              Ruuen.
            </a>
          </p>
        </div>
      </div>

      <nav className="flex flex-1 gap-3 flex-wrap lg:flex-col lg:items-end lg:justify-center">
        {!isLoggedIn && (
          <Button
            text="Log in with Spotify"
            colourScheme="spotify"
            isLoading={false}
            onClick={initSpotifyLogin}
          />
        )}
        {isLoggedIn && (
          <ButtonLink
            href="/api/logout"
            text="Log out"
            colourScheme="warning"
          />
        )}
        <ButtonLink
          href="https://github.com/ruuen/exportify"
          text="Source Code"
        />
      </nav>
    </header>
  );
}

export default PageHeader;
