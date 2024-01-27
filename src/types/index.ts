export type SearchMode = "public" | "private";
export type ButtonColourScheme = "default" | "spotify" | "light";

export interface SpotifyUser {
  // TODO: replace fields with actual representation when building Spotify API functionality
  userId: number;
}

export interface SearchFormInputs {
  playlistUrl: string;
}

export interface AccessToken {
  access_token: string;
  token_type: string;
  scope?: string;
  expires_in: number;
}

export interface ResponseError {
  message: string;
}

export interface Playlist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
  owner: {
    display_name: string;
    external_urls: {
      spotify: string;
    };
  };
  images: Array<PlaylistImage>;
  tracks: {
    total: number;
  };
}

export interface PlaylistImage {
  width?: number;
  height?: number;
  url: string;
}

export type PlaylistData = [
  {
    name: string;
    album: {
      name: string;
    };
    artists: [
      {
        name: string;
      }
    ];
  }
];
