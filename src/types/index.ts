export type SearchMode = "public" | "private";
export type ButtonColourScheme = "default" | "spotify" | "light";

export interface SpotifyUser {
  // TODO: replace fields with actual representation when building Spotify API functionality
  userId: number;
}

export interface SearchFormInputs {
  playlistUrl: string;
}
