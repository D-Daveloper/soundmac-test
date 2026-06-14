import { albumFromApi, TrackForm } from "@/app/type";
import { generateCatalogNumber, generateISRC, generateMultipleISRC } from "@/services/dsp/dsp.service";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import { validateNonDraftTracks } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import AudioUploadTrackerModel from "@/util/models/AudioUploadTrackerModel";
import TrackModel from "@/util/models/trackModel";
import User from "@/util/models/userModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    let tracks;
    await dbConnect();
    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    const albumTitle = searchParams.get("albumTitle");
    console.log(albumTitle);

    if (!albumTitle) {
      return NextResponse.json(
        {
          data: [],
          msg: "Please Add Tracks",
        },
        { status: 404 },
      );
    }

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 401 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 401 },
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 401 });
    }
    tracks = await TrackModel.find({
      user: userJwt.user,
      albumName: albumTitle,
    }).lean();

    if (tracks && tracks.length <= 0) {
      return NextResponse.json(
        { msg: "Please Add Tracks", data: tracks },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        data: tracks,
        msg: "Successful",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ msg: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { msg: "An unknown error occurred" },
        { status: 500 },
      );
    }
  }
}

export async function POST(req: Request) {
  try {
    const { tracks, album }: { tracks: TrackForm[]; album: string } =
      await req.json();
    console.log(tracks);

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json({ msg: "Tracks required" }, { status: 400 });
    }

    await dbConnect();

    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = await User.findById(userJwt.user);
    if (!user || !user.confirmed || user.otp !== null) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    } else if (user.premium !== true) {
      return NextResponse.json(
        { msg: "Please upgrade your account." },
        { status: 402 },
      );
    } else if (user.premium && new Date() > new Date(user.premiumExpiration!)) {
      user.premium = false;
      user.premiumExpiration = null;
      await user.save();
      return NextResponse.json(
        { msg: "Please upgrade your account." },
        { status: 402 },
      );
    }

    if (user!.type === "EMERGING_ARTIST") {
      return NextResponse.json(
        { msg: "Emerging artists can not upload tracks" },
        { status: 403 },
      );
    }

    const userAlbum = await AlbumModel.findOne<albumFromApi>({
      user: userJwt.user,
      releaseTitle: album,
    });
    if (!userAlbum) {
      return NextResponse.json({ msg: "Invalid Album" }, { status: 400 });
    }

    const uploladedTracks = await TrackModel.find({
      upc: userAlbum.upc,
    });

    if (uploladedTracks.length === parseInt(userAlbum.numberOfTracks, 10)) {
      return NextResponse.json(
        { msg: "Maximum number of tracks reached" },
        { status: 400 },
      );
    }
    // console.log("first",userAlbum.unassignedNumbers);
    const array_of_tracks_dont_have_isrc = [];
    for (let i = 0; i < tracks.length; i++) {
      if (
        tracks[i].featured_artist.length === 1 &&
        tracks[i].featured_artist.some((artist) => artist.artistName === "")
      ) {
        tracks[i].featured_artist = [];
      }
      if (!tracks[i].isrc) {
        array_of_tracks_dont_have_isrc.push(1)
      }
      const err = validateNonDraftTracks(
        tracks[i],
        userAlbum.unassignedNumbers,
      );
      userAlbum.unassignedNumbers = userAlbum.unassignedNumbers.filter(
        (item, index) => item != tracks[i].track_number,
      );
      if (err) {
        return NextResponse.json(
          { msg: "Track " + (i + 1) + " " + err },
          { status: 400 },
        );
      }
    }
    let multipleIsrc: string[] = []
    if (array_of_tracks_dont_have_isrc.length > 0) { multipleIsrc = await generateMultipleISRC(array_of_tracks_dont_have_isrc.length); }
    console.log(multipleIsrc);

    const docs = tracks.map((track, index) => ({
      releaseTitle: track.title,
      genre: track.genre,
      releaseLanguage: track.language,
      releaseAudio: track.s3key,
      songWriter: track.song_writer,
      producer: track.producer,
      performer: track.performer,
      featuredArtist: track.featured_artist || [],
      explicitContent: track.explicit_content,
      lyrics: track.lyrics,
      startClip: track.start_clip,
      upc: userAlbum.upc,
      isrc: track.isrc || multipleIsrc.length > 0 ? multipleIsrc[index] : null,
      artistName: userAlbum.artistName,
      artist: userAlbum.artist,
      albumName: userAlbum.releaseTitle,
      album: userAlbum._id,
      trackNumber: track.track_number,
      anotherDistributionCheck: track.another_distribution_check,
      user: user!._id,
      releaseStatus: "pending",
      catalogNumber: async () => await generateCatalogNumber(),
    }));


    console.log(docs);

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await AudioUploadTrackerModel.updateMany(
        {
          upc: userAlbum.upc,
          status: "PENDING",
        },
        { $set: { status: "ACTIVE" } },
        { session },
      ),
        await TrackModel.insertMany(docs, { session }),
        await AlbumModel.findByIdAndUpdate(userAlbum._id, {
          unassignedNumbers: userAlbum.unassignedNumbers,
        }, { session })
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }


    return NextResponse.json({ msg: "Tracks saved" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return handleMongooseValidationError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const { tracks, album }: { tracks: TrackForm[]; album: string } =
      await req.json();
    console.log(tracks);

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json({ msg: "Tracks required" }, { status: 400 });
    }

    await dbConnect();

    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = await User.findById(userJwt.user).lean();
    if (!user || !user.confirmed || user.otp !== null) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const userAlbum = await AlbumModel.findOne<albumFromApi>({
      user: userJwt.user,
      releaseTitle: album,
    }).lean();

    if (!userAlbum || userAlbum.releaseStatus === "approved") {
      return NextResponse.json({ msg: "Invalid Album" }, { status: 400 });
    }
    for (let i = 0; i < tracks.length; i++) {
      if (
        tracks[i].featured_artist.length === 1 &&
        tracks[i].featured_artist.some((artist) => artist.artistName === "")
      ) {
        tracks[i].featured_artist = [];
      }
      const err = validateNonDraftTracks(
        tracks[i],
        userAlbum.unassignedNumbers,
        true
      );
      if (err) {
        return NextResponse.json(
          { msg: "Track " + (i + 1) + " " + err },
          { status: 400 },
        );
      }
    }

    const bulkOps = tracks.map((track, index) => ({
      updateOne: {
        // 1. Find the specific track by its unique identifier (e.g., track._id or track.title)
        filter: {
          upc: userAlbum.upc,
          _id: track.id // Or use another unique field if _id isn't in 'track'
        },
        // 2. Apply the updates using the proper $set operator
        update: {
          $set: {
            releaseTitle: track.title,
            genre: track.genre,
            releaseLanguage: track.language,
            releaseAudio: track.s3key,
            songWriter: track.song_writer,
            producer: track.producer,
            performer: track.performer,
            featuredArtist: track.featured_artist || [],
            explicitContent: track.explicit_content,
            lyrics: track.lyrics,
            startClip: track.start_clip,
            artistName: userAlbum.artistName,
            artist: userAlbum.artist,
            albumName: userAlbum.releaseTitle,
            album: userAlbum._id,
            user: user._id,
            releaseStatus: "pending",
          }
        },
      }
    }));
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      // Run all updates in one efficient command
      await TrackModel.bulkWrite(bulkOps, { session });

      await AudioUploadTrackerModel.updateMany(
        {
          upc: userAlbum.upc,
          status: "PENDING",
        },
        { $set: { status: "ACTIVE" } },
        { session },
      );
      await session.commitTransaction();

    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      await session.endSession();
    }

    return NextResponse.json({ msg: "Tracks saved" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return handleMongooseValidationError(error);
  }
}
