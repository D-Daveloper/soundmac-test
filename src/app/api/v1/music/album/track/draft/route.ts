import { albumFromApi, TrackForm } from "@/app/type";
import { generateMultipleCatalogNumber } from "@/services/dsp/dsp.service";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { validateDraftTracks } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import TrackModel from "@/util/models/trackModel";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const { tracks, album }: { tracks: TrackForm[]; album: albumFromApi } =
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

    const uploadedCount = await TrackModel.countDocuments({
      upc: userAlbum.upc,
    });

    if (uploadedCount >= parseInt(userAlbum.numberOfTracks, 10) || tracks.length >= parseInt(userAlbum.numberOfTracks, 10)) {
      return NextResponse.json(
        { msg: "Maximum number of tracks reached" },
        { status: 400 },
      );
    }

    for (let i = 0; i < tracks.length; i++) {
      if (
        tracks[i].song_writer &&
        (!(tracks[i].song_writer instanceof Array) ||
          (tracks[i].song_writer.length === 1 &&
            tracks[i].song_writer.some((artist) => artist.first_name === "") &&
            tracks[i].song_writer.some((artist) => artist.last_name === "")))
      ) {
        tracks[i].song_writer = [];
      }
      if (
        tracks[i].performer &&
        (!(tracks[i].performer instanceof Array) ||
          (tracks[i].performer.length === 1 &&
            tracks[i].performer.some((artist) => artist.name === "") &&
            tracks[i].performer.some((artist) => artist.role === "")))
      ) {
        tracks[i].performer = [];
      }
      if (
        tracks[i].featured_artist &&
        (!(tracks[i].featured_artist instanceof Array) ||
          (tracks[i].featured_artist.length === 1 &&
            tracks[i].featured_artist.some(
              (artist) => artist.artistName === "",
            )))
      ) {
        tracks[i].featured_artist = [];
      }
      if (
        tracks[i].producer &&
        (!(tracks[i].producer instanceof Array) ||
          (tracks[i].producer.length === 1 &&
            tracks[i].producer.some((artist) => artist.name === "")))
      ) {
        tracks[i].producer = [];
      }
      const err = validateDraftTracks(tracks[i],userAlbum.unassignedNumbers);
      userAlbum.unassignedNumbers = userAlbum.unassignedNumbers.filter((item,index)=> item != tracks[i].track_number);
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
      songWriter: track.song_writer || [],
      producer: track.producer || [],
      performer: track.performer || [],
      featuredArtist: track.featured_artist || [],
      explicitContent: track.explicit_content,
      lyrics: track.lyrics,
      startClip: track.start_clip,
      upc: track.upc,
      artistName: userAlbum.artistName,
      artist: userAlbum.artist,
      albumName: userAlbum.releaseTitle,
      album: userAlbum._id,
      trackNumber: track.track_number,
      user: user!._id,
      releaseStatus: "draft",
    }));

    await TrackModel.insertMany(docs);
    await AlbumModel.findByIdAndUpdate(userAlbum._id,{unassignedNumbers:userAlbum.unassignedNumbers});

    return NextResponse.json({ msg: "Tracks saved" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return handleMongooseValidationError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const { tracks, album }: { tracks: TrackForm[]; album: albumFromApi } =
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

    const uploadedCount = await TrackModel.countDocuments({
      upc: userAlbum.upc,
    });

    if (uploadedCount >= parseInt(userAlbum.numberOfTracks, 10) || tracks.length >= parseInt(userAlbum.numberOfTracks, 10)) {
      return NextResponse.json(
        { msg: "Maximum number of tracks reached" },
        { status: 400 },
      );
    }

    for (let i = 0; i < tracks.length; i++) {
      if (
        tracks[i].song_writer &&
        (!(tracks[i].song_writer instanceof Array) ||
          (tracks[i].song_writer.length === 1 &&
            tracks[i].song_writer.some((artist) => artist.first_name === "") &&
            tracks[i].song_writer.some((artist) => artist.last_name === "")))
      ) {
        tracks[i].song_writer = [];
      }
      if (
        tracks[i].performer &&
        (!(tracks[i].performer instanceof Array) ||
          (tracks[i].performer.length === 1 &&
            tracks[i].performer.some((artist) => artist.name === "") &&
            tracks[i].performer.some((artist) => artist.role === "")))
      ) {
        tracks[i].performer = [];
      }
      if (
        tracks[i].featured_artist &&
        (!(tracks[i].featured_artist instanceof Array) ||
          (tracks[i].featured_artist.length === 1 &&
            tracks[i].featured_artist.some(
              (artist) => artist.artistName === "",
            )))
      ) {
        tracks[i].featured_artist = [];
      }
      if (
        tracks[i].producer &&
        (!(tracks[i].producer instanceof Array) ||
          (tracks[i].producer.length === 1 &&
            tracks[i].producer.some((artist) => artist.name === "")))
      ) {
        tracks[i].producer = [];
      }
      const err = validateDraftTracks(tracks[i],userAlbum.unassignedNumbers);
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
      songWriter: track.song_writer || [],
      producer: track.producer || [],
      performer: track.performer || [],
      featuredArtist: track.featured_artist || [],
      explicitContent: track.explicit_content,
      lyrics: track.lyrics,
      startClip: track.start_clip,
      upc: track.upc,
      artistName: userAlbum.artistName,
      artist: userAlbum.artist,
      albumName: userAlbum.releaseTitle,
      album: userAlbum._id,
      // trackNumber: track.track_number,
      user: user!._id,
      releaseStatus: "draft",
    }));

    await TrackModel.deleteMany({ upc: userAlbum.upc });
    await TrackModel.insertMany(docs);


    return NextResponse.json({ msg: "Tracks saved" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return handleMongooseValidationError(error);
  }
}
