import { TrackForm } from "@/app/type";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { validateDraftTracks } from "@/util/middleware/functions";
import { requireActiveSubscription } from "@/util/middleware/subscription";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel, { albumType } from "@/util/models/AlbumModel";
import TrackModel from "@/util/models/trackModel";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";


// export async function POST(req: Request) {
//   try {
//     const { tracks, albumId }: { tracks: TrackForm[]; albumId: string } =
//       await req.json();
//     console.log(tracks);

//     if (!Array.isArray(tracks) || tracks.length === 0) {
//       return NextResponse.json({ msg: "Tracks required" }, { status: 400 });
//     }

//     await dbConnect();

//     const userData = await verifyJWT();
//     const userJwt = verifyUser(userData);
//     if (userJwt.msg) {
//       return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
//     }

//     const user = await User.findById(userJwt.user);
//     if (!user || !user.confirmed || user.otp !== null) {
//       return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
//     }

//     const userAlbum = await AlbumModel.findById<albumType>(albumId);

//     if (!userAlbum) {
//       return NextResponse.json({ msg: "Invalid Album" }, { status: 400 });
//     }

//     const uploadedCount = await TrackModel.countDocuments({
//       upc: userAlbum.upc,
//     });

//     if (uploadedCount >= parseInt(userAlbum.numberOfTracks!, 10) || tracks.length >= parseInt(userAlbum.numberOfTracks!, 10)) {
//       return NextResponse.json(
//         { msg: "Maximum number of tracks reached" },
//         { status: 400 },
//       );
//     }

//     for (let i = 0; i < tracks.length; i++) {
//       if (
//         tracks[i].songWriter &&
//         (!(tracks[i].songWriter instanceof Array) ||
//           (tracks[i].songWriter.length === 1 &&
//             tracks[i].songWriter.some((artist) => artist.first_name === "") &&
//             tracks[i].songWriter.some((artist) => artist.last_name === "")))
//       ) {
//         tracks[i].songWriter = [];
//       }
//       if (
//         tracks[i].performer &&
//         (!(tracks[i].performer instanceof Array) ||
//           (tracks[i].performer.length === 1 &&
//             tracks[i].performer.some((artist) => artist.name === "") &&
//             tracks[i].performer.some((artist) => artist.role === "")))
//       ) {
//         tracks[i].performer = [];
//       }
//       if (
//         tracks[i].featuredArtist &&
//         (!(tracks[i].featuredArtist instanceof Array) ||
//           (tracks[i].featuredArtist.length === 1 &&
//             tracks[i].featuredArtist.some(
//               (artist) => artist.artistName === "",
//             )))
//       ) {
//         tracks[i].featuredArtist = [];
//       }
//       if (
//         tracks[i].producer &&
//         (!(tracks[i].producer instanceof Array) ||
//           (tracks[i].producer.length === 1 &&
//             tracks[i].producer.some((artist) => artist.name === "")))
//       ) {
//         tracks[i].producer = [];
//       }
//       const err = validateDraftTracks(tracks[i], userAlbum.unassignedNumbers);
//       userAlbum.unassignedNumbers = userAlbum.unassignedNumbers.filter((item, index) => item != tracks[i].trackNumber);
//       if (err) {
//         return NextResponse.json(
//           { msg: "Track " + (i + 1) + " " + err },
//           { status: 400 },
//         );
//       }
//     }

//     const docs = tracks.map((track, index) => ({
//       releaseTitle: track.title,
//       genre: track.genre,
//       releaseLanguage: track.language,
//       songWriter: track.songWriter || [],
//       producer: track.producer || [],
//       performer: track.performer || [],
//       featuredArtist: track.featuredArtist || [],
//       explicitContent: track.explicitContent,
//       lyrics: track.lyrics,
//       startClip: track.startClip,
//       upc: track.upc,
//       // artistName: userAlbum.artistName,
//       artist: userAlbum.artist,
//       // albumName: userAlbum.releaseTitle,
//       album: albumId,
//       trackNumber: track.trackNumber,
//       user: user!._id,
//       // releaseStatus: "draft",
//     }));

//     await TrackModel.insertMany(docs);
//     await AlbumModel.findByIdAndUpdate(albumId, { unassignedNumbers: userAlbum.unassignedNumbers });

//     return NextResponse.json({ msg: "Tracks saved" }, { status: 200 });
//   } catch (error) {
//     console.log(error);
//     return handleMongooseValidationError(error);
//   }
// }

// export async function PUT(req: Request) {
//   try {
//     const { tracks, albumId }: { tracks: TrackForm[]; albumId: string } =
//       await req.json();
//     console.log(tracks);

//     if (!Array.isArray(tracks) || tracks.length === 0) {
//       return NextResponse.json({ msg: "Tracks required" }, { status: 400 });
//     }

//     await dbConnect();

//     const userData = await verifyJWT();
//     const userJwt = verifyUser(userData);
//     if (userJwt.msg) {
//       return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
//     }

//     const user = await User.findById(userJwt.user);
//     if (!user || !user.confirmed || user.otp !== null) {
//       return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
//     }
//     //      else if (user.premium !== true) {
//     //   return NextResponse.json(
//     //     { msg: "Please upgrade your account." },
//     //     { status: 402 },
//     //   );
//     // } else if (user.premium && new Date() > new Date(user.premiumExpiration!)) {
//     //   user.premium = false;
//     //   user.premiumExpiration = null;
//     //   await user.save();
//     //   return NextResponse.json(
//     //     { msg: "Please upgrade your account." },
//     //     { status: 402 },
//     //   );
//     // }

//     else if (user!.type === "EMERGING_ARTIST") {
//       return NextResponse.json(
//         { msg: "Emerging artists can not upload tracks" },
//         { status: 403 },
//       );
//     } else {
//       const subError = requireActiveSubscription(user)
//       if (subError) {
//         return NextResponse.json(
//           { msg: subError.msg },
//           { status: subError.status },
//         )
//       }

//     }

//     const userAlbum = await AlbumModel.findById<albumType>(albumId);

//     if (!userAlbum) {
//       return NextResponse.json({ msg: "Invalid Album" }, { status: 400 });
//     }

//     const uploadedCount = await TrackModel.countDocuments({
//       upc: userAlbum.upc,
//     });

//     if (uploadedCount >= parseInt(userAlbum.numberOfTracks!, 10) || tracks.length >= parseInt(userAlbum.numberOfTracks!, 10)) {
//       return NextResponse.json(
//         { msg: "Maximum number of tracks reached" },
//         { status: 400 },
//       );
//     }

//     for (let i = 0; i < tracks.length; i++) {
//       if (
//         tracks[i].songWriter &&
//         (!(tracks[i].songWriter instanceof Array) ||
//           (tracks[i].songWriter.length === 1 &&
//             tracks[i].songWriter.some((artist) => artist.first_name === "") &&
//             tracks[i].songWriter.some((artist) => artist.last_name === "")))
//       ) {
//         tracks[i].songWriter = [];
//       }
//       if (
//         tracks[i].performer &&
//         (!(tracks[i].performer instanceof Array) ||
//           (tracks[i].performer.length === 1 &&
//             tracks[i].performer.some((artist) => artist.name === "") &&
//             tracks[i].performer.some((artist) => artist.role === "")))
//       ) {
//         tracks[i].performer = [];
//       }
//       if (
//         tracks[i].featuredArtist &&
//         (!(tracks[i].featuredArtist instanceof Array) ||
//           (tracks[i].featuredArtist.length === 1 &&
//             tracks[i].featuredArtist.some(
//               (artist) => artist.artistName === "",
//             )))
//       ) {
//         tracks[i].featuredArtist = [];
//       }
//       if (
//         tracks[i].producer &&
//         (!(tracks[i].producer instanceof Array) ||
//           (tracks[i].producer.length === 1 &&
//             tracks[i].producer.some((artist) => artist.name === "")))
//       ) {
//         tracks[i].producer = [];
//       }
//       const err = validateDraftTracks(tracks[i], userAlbum.unassignedNumbers);
//       if (err) {
//         return NextResponse.json(
//           { msg: "Track " + (i + 1) + " " + err },
//           { status: 400 },
//         );
//       }
//     }

//     const docs = tracks.map((track, index) => ({
//       releaseTitle: track.title,
//       genre: track.genre,
//       releaseLanguage: track.language,
//       songWriter: track.songWriter || [],
//       producer: track.producer || [],
//       performer: track.performer || [],
//       featuredArtist: track.featuredArtist || [],
//       explicitContent: track.explicitContent,
//       lyrics: track.lyrics,
//       startClip: track.startClip,
//       upc: track.upc,
//       // artistName: userAlbum.artistName,
//       artist: userAlbum.artist,
//       // albumName: userAlbum.releaseTitle,
//       album: albumId,
//       // trackNumber: track.trackNumber,
//       user: user!._id,
//       // releaseStatus: "draft",
//     }));

//     await TrackModel.deleteMany({ upc: userAlbum.upc });
//     await TrackModel.insertMany(docs);


//     return NextResponse.json({ msg: "Tracks saved" }, { status: 200 });
//   } catch (error) {
//     console.log(error);
//     return handleMongooseValidationError(error);
//   }
// }
