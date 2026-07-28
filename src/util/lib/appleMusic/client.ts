import axios from "axios";
import jwt from "jsonwebtoken";

const STOREFRONT = "us";

let cachedToken: { value: string; expiresAt: number } | null = null;

function getAppleDeveloperToken(): string {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY!.replace(/\\n/g, "\n");

  const token = jwt.sign({}, privateKey, {
    algorithm: "ES256",
    expiresIn: "180d",
    issuer: process.env.APPLE_MUSIC_TEAM_ID,
    header: {
      alg: "ES256",
      kid: process.env.APPLE_MUSIC_KEY_ID,
    },
  });

  cachedToken = {
    value: token,
    expiresAt: Date.now() + 179 * 24 * 60 * 60 * 1000, // refresh a day early
  };
  return token;
}

export async function lookupSongByIsrc(isrc: string) {
  const token = getAppleDeveloperToken();
  const response = await axios.get(
    `https://api.music.apple.com/v1/catalog/${STOREFRONT}/songs`,
    {
      params: { "filter[isrc]": isrc },
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const songs = response.data?.data ?? [];
  if (songs.length === 0) return { live: false as const };

  const song = songs[0];
  return {
    live: true as const,
    appleSongId: song.id,
    artistName: song.attributes?.artistName,
  };
}

export async function lookupAlbumByUpc(upc: string) {
  const token = getAppleDeveloperToken();
  const response = await axios.get(
    `https://api.music.apple.com/v1/catalog/${STOREFRONT}/albums`,
    {
      params: { "filter[upc]": upc },
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const albums = response.data?.data ?? [];
  if (albums.length === 0) return { live: false as const };

  const album = albums[0];
  return {
    live: true as const,
    appleAlbumId: album.id,
    artistName: album.attributes?.artistName,
  };
}