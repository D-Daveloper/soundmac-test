import { inngest } from "../inngest";
import dbConnect from "@/util/db";
import SongModel from "@/util/models/songModel";
import AlbumModel from "@/util/models/AlbumModel";
import * as spotify from "@/util/lib/spotify/client";
import * as appleMusic from "@/util/lib/appleMusic/client";

export const deliveryLogSync = inngest.createFunction(
  { id: "delivery-log-sync", triggers: { cron: "0 */6 * * *" } },

  async ({ step }) => {
    await step.run("connect-db", async () => {
      await dbConnect();
    });

    const approvedSongs = await step.run("fetch-approved-songs", async () => {
      return SongModel.find(
        { releaseStatus: "approved" },
        { isrc: 1, upc: 1 }
      ).lean();
    });

    const approvedAlbums = await step.run("fetch-approved-albums", async () => {
      return AlbumModel.find(
        { releaseStatus: "approved" },
        { upc: 1 }
      ).lean();
    });

    for (const song of approvedSongs) {
      await step.run(`sync-song-${song._id}`, async () => {
        const [spotifyResult, appleResult] = await Promise.all([
          spotify.lookupTrackByIsrc(song.isrc).catch(() => ({ live: false as const })),
          appleMusic.lookupSongByIsrc(song.isrc).catch(() => ({ live: false as const })),
        ]);

        await SongModel.findByIdAndUpdate(song._id, {
          platformDelivery: [
            { platform: "spotify", status: spotifyResult.live ? "live" : "pending", lastCheckedAt: new Date() },
            { platform: "apple_music", status: appleResult.live ? "live" : "pending", lastCheckedAt: new Date() },
          ],
        });
      });
    }

    for (const album of approvedAlbums) {
      await step.run(`sync-album-${album._id}`, async () => {
        const [spotifyResult, appleResult] = await Promise.all([
          spotify.lookupAlbumByUpc(album.upc).catch(() => ({ live: false as const })),
          appleMusic.lookupAlbumByUpc(album.upc).catch(() => ({ live: false as const })),
        ]);

        await AlbumModel.findByIdAndUpdate(album._id, {
          platformDelivery: [
            { platform: "spotify", status: spotifyResult.live ? "live" : "pending", lastCheckedAt: new Date() },
            { platform: "apple_music", status: appleResult.live ? "live" : "pending", lastCheckedAt: new Date() },
          ],
        });
      });
    }

    return { syncedSongs: approvedSongs.length, syncedAlbums: approvedAlbums.length };
  }
);