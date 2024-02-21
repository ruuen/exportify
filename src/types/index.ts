export type SearchMode = "public" | "private";
export type ButtonColourScheme = "default" | "spotify" | "light" | "warning";
export type FileFormat = "csv" | "json";

export interface SearchFormInputs {
  playlistUrl: string;
}

export interface AccessToken {
  access_token: string;
  token_type: string;
  scope?: string;
  expires_in: number;
}

export interface PagedApiResponse<T> {
  next?: string | null;
  items: T;
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
  owner: PlaylistOwner;
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

export interface PlaylistOwner {
  display_name: string;
  external_urls: {
    spotify: string;
  };
}

export type PlaylistData = Array<{ track: PlaylistItem }>;

export interface PlaylistItem {
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
