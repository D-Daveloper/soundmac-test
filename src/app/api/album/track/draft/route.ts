import { albumFromApi, TrackForm } from "@/app/type";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import {
  parseAlbumFormData,
  parseTrackFormData,
  validateDraftAlbums,
  validateDraftTracks,
} from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import Artist from "@/util/models/artistModel";
import TrackModel from "@/util/models/trackModel";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     let userArtist = null;
//     let releaseTitleAlreadyExist = null;
//     let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
//     const formData = await req.formData();

//     const payload = parseTrackFormData(formData);
//     payload.upc = formData.get("upc")?.toString() ?? null; //different name for drafts

//     if (!payload) {
//       return NextResponse.json({ msg: "Invalid form data" }, { status: 400 });
//     }

//     if (
//       !payload.artist ||
//       payload.artist.trim() === "" ||
//       typeof payload.artist !== "string"
//     ) {
//       return NextResponse.json({ msg: "Artist is required" }, { status: 400 });
//     }

//     await dbConnect();

//     const userData = await verifyJWT();
//     const userJwt = verifyUser(userData);
//     if (userJwt.msg) {
//       return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
//     }

//     const user = userJwt.user ? await User.findById(userJwt.user) : null;

//     if (!user) {
//       Uploaderror = { msg: "Invalid Request", status: 404 };
//     } else if (!user.confirmed) {
//       Uploaderror = { msg: "Please verify your email address", status: 400 };
//     } else if (user.otp !== null) {
//       Uploaderror = { msg: "Please login", status: 400 };
//     } else {
//       userArtist = await Artist.findOne({
//         user: userJwt.user,
//         artistName: (payload.artist as string)?.trim(),
//       });
//     }

//     if (Uploaderror != null) {
//       return NextResponse.json(
//         { msg: Uploaderror.msg },
//         { status: Uploaderror.status },
//       );
//     } // return any errors up to this point and delete the song

//     if (!userArtist) {
//       return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
//     }
//     releaseTitleAlreadyExist = await TrackModel.find({
//         upc: payload.upc,
//         releaseTitle: payload.title,
//       });

//     if (releaseTitleAlreadyExist && releaseTitleAlreadyExist.length > 0) {
//       return NextResponse.json(
//         { msg: "Release title already exists" },
//         { status: 400 },
//       );
//     }
//     if (
//       payload.song_writer &&
//       (!(payload.song_writer instanceof Array) ||
//         (payload.song_writer.length === 1 &&
//           payload.song_writer.some((artist) => artist.first_name === "") &&
//           payload.song_writer.some((artist) => artist.last_name === "")))
//     ) {
//       payload.song_writer = [];
//     }
//     if (
//       payload.performer &&
//       (!(payload.performer instanceof Array) ||
//         (payload.performer.length === 1 &&
//           payload.performer.some((artist) => artist.name === "") &&
//           payload.performer.some((artist) => artist.role === "")))
//     ) {
//       payload.performer = [];
//     }
//     if (
//       payload.featured_artist &&
//       (!(payload.featured_artist instanceof Array) ||
//         (payload.featured_artist.length === 1 &&
//           payload.featured_artist.some((artist) => artist.artistName === "")))
//     ) {
//       payload.featured_artist = [];
//     }
//     if (
//       payload.producer &&
//       (!(payload.producer instanceof Array) ||
//         (payload.producer.length === 1 &&
//           payload.producer.some((artist) => artist.name === "")))
//     ) {
//       payload.producer = [];
//     }
//     console.log({ ...payload });

//     const isDraftSongValid = validateDraftTracks(payload);

//     if (isDraftSongValid != null) {
//       return NextResponse.json({ msg: isDraftSongValid }, { status: 400 });
//     }

//     const savedSong = new TrackModel({
//       releaseTitle: payload.title,
//       genre: payload.genre,
//       releaseLanguage: payload.language,
//       songWriter: payload.song_writer,
//       producer: payload.producer,
//       performer: payload.performer,
//       featuredArtist: payload.featured_artist,
//       anotherDistributionCheck: payload.anotherDistributionCheck,
//       explicitContent: payload.explicitContent,
//       lyrics: payload.lyrics,
//       startClip: payload.startClip,
//       upc: payload.upc,
//       isrc: payload.isrc ,
//       artistName: userArtist.artistName,
//       album:"",
//       albumName:"",
//       artist: userArtist._id,
//       user: user!._id,
//       releaseStatus: "draft",
//       catalogNumber: "SM" + Date.now(),
//     });

//     await savedSong.save();

//     return NextResponse.json({ msg: "success" }, { status: 200 });
//   } catch (error: unknown) {
//     console.log(error);

//     return handleMongooseValidationError(error);
//   }
// }

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

    const uploladedTracks = await TrackModel.find({
      upc: userAlbum.upc,
    });
    
    if (uploladedTracks.length === parseInt(userAlbum.numberOfTracks,10)){
        return NextResponse.json({ msg: "Maximum number of tracks reached" }, { status: 400 });
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
      const err = validateDraftTracks(tracks[i]);
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
      isrc: track.isrc || Date.now() + index,
      artistName: userAlbum.artistName,
      artist: userAlbum.artist,
      albumName: userAlbum.releaseTitle,
      album: userAlbum._id,
      trackNumber: track.track_number,
      user: user!._id,
      releaseStatus: "draft",
      catalogNumber: "SM" + Date.now() + index,
    }));

    await TrackModel.insertMany(docs);

    return NextResponse.json({ msg: "Tracks saved" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return handleMongooseValidationError(error);
  }
}
