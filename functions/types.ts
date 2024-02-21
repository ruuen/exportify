export interface SpotifyAccessToken {
  access_token: string;
  token_type: string;
  expires_at?: number;
}

export interface PagedSpotifyResponse<T> {
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  items: Array<T>;
}

export interface PagedApiResponse<T> {
  next?: string | null;
  items: Array<T>;
}
