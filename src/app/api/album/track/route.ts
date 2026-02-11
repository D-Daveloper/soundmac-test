import { albumFromApi, TrackForm } from "@/app/type";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { validateNonDraftTracks } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import TrackModel from "@/util/models/trackModel";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    let tracks;
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    const albumTitle = searchParams.get("albumTitle");
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
    tracks = await TrackModel.find({ albumName: albumTitle, user: userJwt.user });

    if (tracks && tracks.length <= 0) {
      return NextResponse.json({ msg: "Please Add Tracks",data: tracks, }, { status: 400 });
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

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = await User.findById(userJwt.user);
    if (!user || !user.confirmed || user.otp !== null) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
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

    for (let i = 0; i < tracks.length; i++) {
      const err = validateNonDraftTracks(tracks[i]);
      if (err) {
        return NextResponse.json(
          { msg: "Track " + (i + 1) + " " + err },
          { status: 400 },
        );
      }
    }

    const docs = tracks.map((track, index) => ({
      releaseTitle: track.title,
      genre: track.genre,
      releaseLanguage: track.language,
      releaseAudio: track.s3key,
      songWriter: track.song_writer || [],
      producer: track.producer || [],
      performer: track.performer || [],
      featuredArtist: track.featured_artist || [],
      explicitContent: track.explicit_content,
      lyrics: track.lyrics,
      startClip: track.start_clip,
      upc: userAlbum.upc,
      isrc: track.isrc || Date.now() + index,
      artistName: userAlbum.artistName,
      artist: userAlbum.artist,
      albumName: userAlbum.releaseTitle,
      album: userAlbum._id,
      trackNumber: track.track_number,
      anotherDistributionCheck: track.another_distribution_check,
      user: user!._id,
      releaseStatus: "pending",
      catalogNumber: "SM" + Date.now() + index,
    }));

    // await AudioUploadTrackerModel.findOneAndUpdate(
    //   {
    //     _id: payload.uploadId,
    //     s3Key: payload.s3key,
    //     user: user!._id,
    //     status: "PENDING",
    //   },
    //   { status: "ACTIVE" },
    // );
    await TrackModel.insertMany(docs);

    return NextResponse.json({ msg: "Tracks saved" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return handleMongooseValidationError(error);
  }
}
