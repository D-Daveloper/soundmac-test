import { albumFromApi, TrackForm } from "@/app/type";
import { generateMultipleCatalogNumber, generateMultipleISRC } from "@/services/dsp/dsp.service";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import { validateNonDraftTracks } from "@/util/middleware/functions";
import { requireActiveSubscription } from "@/util/middleware/subscription";
import { withIdempotency } from "@/util/middleware/withIdempotency";
import AlbumModel, { albumType } from "@/util/models/AlbumModel";
import AudioUploadTrackerModel from "@/util/models/AudioUploadTrackerModel";
import TrackModel from "@/util/models/trackModel";
import User from "@/util/models/userModel";
import mongoose, { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

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
    const album = await AlbumModel.findOne({ user: user._id, releaseTitle: albumTitle }).lean<albumFromApi>()

    if (!album || album.releaseStatus === "inactive") {
      return NextResponse.json({ msg: "Album not found." }, { status: 404 })
    }

    tracks = await TrackModel.find({
      album: album._id
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
        album,
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

export async function POST(req: NextRequest) {
  try {
    const { tracks, albumId }: { tracks: TrackForm[]; albumId: string } =
      await req.clone().json();
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
    } else {
      const subError = requireActiveSubscription(user)
      if (subError) {
        return NextResponse.json({ msg: subError.msg }, { status: subError.status })
      }
    }

    if (user!.type === "EMERGING_ARTIST") {
      return NextResponse.json(
        { msg: "Emerging artists can not upload tracks" },
        { status: 403 },
      );
    } else if (!albumId || !Types.ObjectId.isValid(albumId)) {
      return NextResponse.json({ msg: "Invalid album id." }, { status: 400 });
    }

    return withIdempotency(req, user!._id, async () => {

      const userAlbum = await AlbumModel.findById<albumType>(albumId);
      if (!userAlbum || userAlbum.releaseStatus === "inactive") {
        return NextResponse.json({ msg: "Invalid Album" }, { status: 400 });
      } else if (userAlbum.user.toString() != user._id.toString()) {
        return NextResponse.json({ msg: "Unauthorized Album." }, { status: 400 });
      }

      const uploadedTracks = await TrackModel.find({
        upc: userAlbum.upc,
      });

      const trackers = await AudioUploadTrackerModel.find({
        user: user._id,
        upc: userAlbum.upc,
        s3Key: { $in: tracks.map((t) => t.s3key) },
        status: "COMPLETED",
      }).lean();

      if (trackers.length !== tracks.length) {
        return NextResponse.json(
          { code: "AUDIO_NOT_UPLOADED", msg: "One or more tracks have no completed upload" },
          { status: 400 },
        );
      }

      if (uploadedTracks.length === parseInt(userAlbum.numberOfTracks!, 10)) {
        return NextResponse.json(
          { msg: "Maximum number of tracks reached" },
          { status: 400 },
        );
      }
      // console.log("first",userAlbum.unassignedNumbers);
      const array_of_tracks_dont_have_isrc = [];
      for (let i = 0; i < tracks.length; i++) {
        if (
          tracks[i].featuredArtist.length === 1 &&
          tracks[i].featuredArtist.some((artist) => artist.artistName === "")
        ) {
          tracks[i].featuredArtist = [];
        }
        if (!tracks[i].isrc) {
          array_of_tracks_dont_have_isrc.push(1)
        }
        const err = validateNonDraftTracks(
          tracks[i],
          userAlbum.unassignedNumbers,
        );
        userAlbum.unassignedNumbers = userAlbum.unassignedNumbers.filter(
          (item, index) => item != tracks[i].trackNumber,
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

      const catalogNumbers = await generateMultipleCatalogNumber(tracks.length)
      console.log(multipleIsrc, catalogNumbers);

      const docs = tracks.map((track, index) => ({
        _id: new mongoose.Types.ObjectId(),
        releaseTitle: track.title,
        genre: track.genre,
        releaseLanguage: track.language,
        releaseAudio: track.s3key,
        songWriter: track.songWriter,
        producer: track.producer,
        performer: track.performer,
        featuredArtist: track.featuredArtist || [],
        explicitContent: track.explicitContent,
        lyrics: track.lyrics,
        startClip: track.startClip,
        upc: userAlbum.upc,
        isrc: track.isrc || multipleIsrc.length > 0 ? multipleIsrc[index] : null,
        // artistName: userAlbum.artistName,
        // artist: userAlbum.artist,
        // albumName: userAlbum.releaseTitle,
        album: albumId,
        trackNumber: track.trackNumber,
        anotherDistributionCheck: track.anotherDistributionCheck,
        user: user!._id,
        // releaseStatus: "pending",
        catalogNumber: catalogNumbers[index],
        compositionType: track.compositionType,
        instrumentalSource: track.instrumentalSource,
        countryOfRecording: track.countryOfRecording,
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
          await AlbumModel.findByIdAndUpdate(albumId, {
            unassignedNumbers: userAlbum.unassignedNumbers,
          }, { session })
        await session.commitTransaction();
      } catch (error) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        throw error;
      } finally {
        await session.endSession();
      }


      return NextResponse.json({ msg: "Tracks saved", tracks: docs }, { status: 201 });
    })
  } catch (error) {
    console.log(error);
    return handleMongooseValidationError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const { tracks, albumId }: { tracks: TrackForm[]; albumId: string } =
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
      return NextResponse.json({ msg: "User unauthorized." }, { status: 401 });
    } else if (!albumId || !Types.ObjectId.isValid(albumId)) {
      return NextResponse.json({ msg: "Invalid album id." }, { status: 400 });
    }

    const userAlbum = await AlbumModel.findById<albumType>(albumId).lean();

    if (!userAlbum || userAlbum.releaseStatus === "inactive") {
      return NextResponse.json({ msg: "Album Not Found" }, { status: 400 });
    } else if (userAlbum.releaseStatus === "approved") {
      return NextResponse.json({ msg: "Approved Albuma can not be edited." }, { status: 400 });
    } else if (user._id.toString() != userAlbum.user.toString()) {
      return NextResponse.json({ msg: "Invalid Album." }, { status: 400 });
    }

    for (let i = 0; i < tracks.length; i++) {
      if (
        tracks[i].featuredArtist.length === 1 &&
        tracks[i].featuredArtist.some((artist) => artist.artistName === "")
      ) {
        tracks[i].featuredArtist = [];
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
            songWriter: track.songWriter,
            producer: track.producer,
            performer: track.performer,
            featuredArtist: track.featuredArtist || [],
            explicitContent: track.explicitContent,
            lyrics: track.lyrics,
            startClip: track.startClip,
            // artistName: userAlbum.artistName,
            // artist: userAlbum.artist,
            // albumName: userAlbum.releaseTitle,
            // album: albumId,
            // user: user._id,
            // releaseStatus: "pending",
            compositionType: track.compositionType,
            instrumentalSource: track.instrumentalSource,
            countryOfRecording: track.countryOfRecording,
          }
        },
      }
    }));
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      // Run all updates in one efficient command
      await TrackModel.bulkWrite(bulkOps, { session });

      // await AudioUploadTrackerModel.updateMany(
      //   {
      //     upc: userAlbum.upc,
      //     status: "PENDING",
      //   },
      //   { $set: { status: "ACTIVE" } },
      //   { session },
      // );
      await session.commitTransaction();

    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      await session.endSession();
    }

    return NextResponse.json(
      { msg: "Tracks saved", tracks: tracks.map((i) => ({ _id: i.id, releaseTitle: i.title })) },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return handleMongooseValidationError(error);
  }
}
