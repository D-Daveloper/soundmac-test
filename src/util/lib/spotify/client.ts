import axios from "axios";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getSpotifyAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64"),
      },
    }
  );

  const { access_token, expires_in } = response.data;
  cachedToken = {
    value: access_token,
    expiresAt: Date.now() + (expires_in - 60) * 1000, // refresh 60s early
  };
  return access_token;
}

export async function lookupTrackByIsrc(isrc: string) {
  const token = await getSpotifyAccessToken();
  const response = await axios.get("https://api.spotify.com/v1/search", {
    params: { q: `isrc:${isrc}`, type: "track" },
    headers: { Authorization: `Bearer ${token}` },
  });

  const tracks = response.data?.tracks?.items ?? [];
  if (tracks.length === 0) return { live: false as const };

  const track = tracks[0];
  return {
    live: true as const,
    spotifyTrackId: track.id,
    artistIds: track.artists.map((a: any) => a.id),
    artistNames: track.artists.map((a: any) => a.name),
  };
}

export async function lookupAlbumByUpc(upc: string) {
  const token = await getSpotifyAccessToken();
  const response = await axios.get("https://api.spotify.com/v1/search", {
    params: { q: `upc:${upc}`, type: "album" },
    headers: { Authorization: `Bearer ${token}` },
  });

  const albums = response.data?.albums?.items ?? [];
  if (albums.length === 0) return { live: false as const };

  const album = albums[0];
  return {
    live: true as const,
    spotifyAlbumId: album.id,
    artistIds: album.artists.map((a: any) => a.id),
    artistNames: album.artists.map((a: any) => a.name),
  };
}