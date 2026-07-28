import { generateCatalogNumber, generateISRC } from "@/services/dsp/dsp.service";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import {
  deleteMultipleFromS3,
} from "@/util/middleware/aws";
import {
  buildSort,
  getYearRange,
  isDateInPast,
  parseSongFormData,
  uploadImage,
  validateNonDraftSongs,
} from "@/util/middleware/functions";
import Artist from "@/util/models/artistModel";
import AudioUploadTrackerModel from "@/util/models/AudioUploadTrackerModel";
import SongModel from "@/util/models/songModel";
import UserNotification from "@/util/models/userNotification";
import User from "@/util/models/userModel";
import { addWeeks } from "date-fns";
import mongoose, { SortOrder } from "mongoose";
import { NextResponse } from "next/server";
import sharp from "sharp";

const bucketName = process.env.AWS_S3_BUCKET!;
export async function POST(req: Request) {
  try {
    let userArtist = null;
    let release = null;
    let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
    let audioTracker = null;
    const formData = await req.formData();
    console.log(formData);

    const payload = parseSongFormData(formData);

    if (!payload) {
      return NextResponse.json({ msg: "Invalid form data" }, { status: 400 });
    }

    if (
      !payload.artist ||
      payload.artist.trim() === "" ||
      typeof payload.artist !== "string"
    ) {
      return NextResponse.json({ msg: "Artist is required" }, { status: 400 });
    }

    const isSongValid = validateNonDraftSongs(payload);
    if (isSongValid != null) {
      return NextResponse.json({ msg: isSongValid }, { status: 400 });
    }
    //  const payload = {uploadId,actionType,title,genre,language,preOrderDate,featured_artist,artist,performer,song_writer,producer,pre_order_check,another_distribution_check,territories,dsp,lyrics,start_clip,isrc,upc,release_date,s3KeyAudio,music_image,copyRightYear,copyRightHolder,explicit_content} = parseSongFormData(formData);
    await dbConnect();

    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      Uploaderror = { msg: "Invalid Request", status: 401 };
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 400 };
    } else if (user.otp !== null) {
      Uploaderror = { msg: "Please login", status: 400 };
    } else if (user.premium !== true) {
      Uploaderror = { msg: "Please upgrade your account.", status: 402 };
    } else if (user.premium && new Date() > new Date(user.premiumExpiration!)) {
      user.premium = false;
      user.premiumExpiration = null;
      await user.save();
      Uploaderror = { msg: "Please upgrade your account.", status: 402 };
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    } // return any errors up to this point and delete the song

    if (user!.type === "EMERGING_ARTIST") {
      const { startOfYear, endOfYear } = getYearRange();

      const releasesThisYear = await SongModel.countDocuments({
        user: user!._id,
        createdAt: {
          $gte: startOfYear,
          $lt: endOfYear,
        },
      });

      if (releasesThisYear >= 2) {
        return NextResponse.json(
          { msg: "Emerging artists can only upload 2 releases per year" },
          { status: 403 },
        );
      }
    }

    const userArtistQuery = Artist.findOne({
      user: userJwt.user,
      artistName: (payload.artist as string).trim(),
    });

    const releaseQuery = SongModel.findOne({
      user: user!._id,
      artistName: (payload.artist as string).trim(),
      releaseTitle: payload.title!.trim(),
    }).lean();

    [userArtist, release] = await Promise.all([
      userArtistQuery, releaseQuery
    ]).catch(err => { throw err; });



    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    } else if (release) {
      return NextResponse.json({ msg: "You already have a release with the same title, please change the title and try again." }, { status: 400 });
    }


    if (!payload.featured_artist) {
      payload.featured_artist = [];
    }

    audioTracker = await AudioUploadTrackerModel.findOne({
      _id: payload.uploadId,
      s3Key: payload.s3KeyAudio,
      user: user!._id,
      status: "PENDING",
    }).lean();

    if (audioTracker == null) {
      // await deleteSingleFromS3(bucketName, (s3KeyAudio as string) || ""); // delete uploaded song if image upload fails
      return NextResponse.json(
        { msg: "Invaild Request,please upload audio" },
        { status: 400 },
      );
    }

    let imageUrl: { error: string | null; coverUrl: string | null } = {
      coverUrl: null,
      error: "Failed to upload image",
    };

    try {
      const musicBuffer = Buffer.from(await payload.musicImage!.arrayBuffer());
      // ---- Resize to distributor standard ----
      const resized = await sharp(musicBuffer)
        .resize(3000, 3000, { fit: "cover" })
        .jpeg({ quality: 90 })
        .toBuffer(); //resize the image for dpm
      console.log("buffer", resized);

      const imageType = payload.musicImage!.type.split("/")[1]; //get the image extension

      const imageStorageLocation = `testing/${payload.upc}/${payload.upc}.${imageType}`; //reconstruct the s3 key for the image using the upc as the name and adding the jpg extension

      imageUrl = await uploadImage(
        imageType,
        resized as Buffer<ArrayBuffer>,
        imageStorageLocation,
      ); //send image to aws
      console.log(imageUrl);

      if (imageUrl.coverUrl == null) {
        // await deleteSingleFromS3(bucketName, payload.s3KeyAudio! as string); // delete uploaded song if image upload fails
        return NextResponse.json({ msg: imageUrl.error }, { status: 400 });
      }
    } catch (error) {
      console.log("upload license error", error);
      throw error;
    }

    let licenseUrl: { error: string | null; coverUrl: string | null } = {
      coverUrl: null,
      error: "Failed to upload license",
    };

    if (payload.license) {
      try {
        const licenseBuffer = Buffer.from(await payload.license!.arrayBuffer());

        const licenseType = payload.license!.type.split("/")[1]; //get the image extension

        const licenseLocation = `testing/${payload.upc}/cover_license_${payload.upc}.${licenseType}`; //reconstruct the s3 key for the image using the upc as the name and adding the jpg extension

        licenseUrl = await uploadImage(
          "application/pdf",
          licenseBuffer,
          licenseLocation,
        ); //send license to aws
        console.log(licenseUrl);

        if (licenseUrl.coverUrl == null) {
          // await deleteMultipleFromS3(bucketName, [payload.s3KeyAudio! as string, imageUrl.coverUrl]); // delete uploaded song if image upload fails
          return NextResponse.json({ msg: licenseUrl.error }, { status: 400 });
        }
      } catch (error) {
        console.log("upload license error", error);
        throw error;
      }
    }
    let catalogNumber = null
    if (payload.isrc) {
      catalogNumber = await generateCatalogNumber();

    } else {
      [catalogNumber, payload.isrc] = await Promise.all([
        generateCatalogNumber(), generateISRC()
      ]).catch((err) => { throw err })
    }
    const savedSong = new SongModel({
      releaseTitle: payload.title,
      releaseImage: imageUrl.coverUrl,
      releaseAudio: payload.s3KeyAudio,
      genre: payload.genre,
      releaseLanguage: payload.language,
      songWriter: payload.song_writer,
      producer: payload.producer,
      performer: payload.performer,
      featuredArtist: payload.featured_artist,
      preOrderCheck: isDateInPast(new Date(payload.releaseDate!)) ? false : payload.preOrderCheck, // check if release date is in the past if it is they cant put preorder date
      anotherDistributionCheck: payload.anotherDistributionCheck,
      explicitContent: payload.explicitContent,
      releaseDate:
        user!.type === "EMERGING_ARTIST"
          ? addWeeks(new Date(), 2)
          : payload.releaseDate,
      preOrderDate:
        payload.preOrderDate == "undefined" ? null : isDateInPast(new Date(payload.releaseDate!)) ? null : payload.preOrderDate,
      copyRightHolder:
        user!.type === "EMERGING_ARTIST"
          ? "Distributed by SoundMac"
          : payload.copyRightHolder,
      copyRightYear: payload.copyRightYear,
      lyrics: payload.lyrics,
      startClip: payload.startClip,
      dsp: payload.dsp,
      upc: payload.upc,
      isrc: payload.isrc,
      territories: payload.territories,
      artistName: userArtist.artistName,
      artist: userArtist._id,
      user: user!._id,
      catalogNumber,
      timeZone: payload.timeZone,
      isCoverSong: payload.isCoverSong,
      license: licenseUrl.coverUrl || ""
    });

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await savedSong.save({ session });
      await UserNotification.create(
  [
    {
      userId: user!._id,
      reason: "Upload Successful",
      message: `Your release "${payload.title}" has been submitted and is pending review.`,
      status: "delivered",
    },
  ],
  { session },
);
      await AudioUploadTrackerModel.findOneAndUpdate(
        {
          _id: payload.uploadId,
          s3Key: payload.s3KeyAudio,
          user: user!._id,
          status: "PENDING",
        },
        { status: "ACTIVE" },
      ).session(session);
      await session.commitTransaction();
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      } console.log("Transaction error:", error);
      return NextResponse.json({ msg: "Failed to save song" }, { status: 500 });
    } finally {
      await session.endSession();
    }
    return NextResponse.json({ msg: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);
    return handleMongooseValidationError(error);
  }
}

//old post method for songs
// export async function POST(req: Request) {
//   try {
//     let userArtist = null;
//     let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
//     let audioTracker = null;
//     const twoWeeks = addWeeks(new Date(), 2); //to check if the upload date is two or more
//     let oneWeek = null; //variable to check for the pre order date
//     const formData = await req.formData();
//     console.log({ ...formData });

//     const uploadId = formData.get("uploadId");
//     const actionType = formData.get("action");
//     const song_title = formData.get("title");
//     const genre = formData.get("genre");
//     const language = formData.get("language");
//     const preOrderDate = formData.get("preOrderDate");
//     const featured_artist = formData
//       .getAll("featured_artist")
//       .map((item) => JSON.parse(item as string));
//     const artist = formData.get("artist");
//     const performer = formData
//       .getAll("performer")
//       .map((item) => JSON.parse(item as string));
//     const song_writer = formData
//       .getAll("song_writer")
//       .map((item) => JSON.parse(item as string));
//     const producer = formData
//       .getAll("producer")
//       .map((item) => JSON.parse(item as string));
//     const pre_order_check = formData.get("pre_order_check");
//     const another_distribution_check = formData.get(
//       "another_distribution_check",
//     );
//     const territories = formData
//       .getAll("territories")
//       .map((item) => JSON.parse(item as string));
//     // const song_audio = formData.get("song_audio");
//     const dsp = formData
//       .getAll("dsp")
//       .map((item) => JSON.parse(item as string));
//     const lyrics = formData.get("lyrics");
//     const start_clip = formData.get("start_clip");
//     const isrc = formData.get("isrc");
//     const upc = formData.get("upc2"); // the new upc from the create aws signed url endpoint
//     const release_date = formData.get("release_date");
//     const s3KeyAudio = formData.get("s3keyAudio");
//     const music_image = formData.get("music_image");
//     const copyRightYear = formData.get("copyRightYear");
//     const copyRightHolder = formData.get("copyRightHolder");
//     const explicitContent = formData.get("explicitContent");

//     const userData = await verifyJWT();
//     const userJwt = verifyUser(userData);
//     if (userJwt.msg) {
//       await deleteSingleFromS3(bucketName, (s3KeyAudio as string) || ""); // delete uploaded song if image upload fails
//       return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
//     }

//     const user = userJwt.user ? await User.findById(userJwt.user) : null;
//     if (!user) {
//       // await deleteSingleFromS3(bucketName,(s3KeyAudio as string) || ""); // delete uploaded song if image upload fails

//       // return NextResponse.json({ msg: "Invalid Request" }, { status: 404 });
//       Uploaderror = { msg: "Invalid Request", status: 404 };
//     } else if (!user.confirmed) {
//       // await deleteSingleFromS3(bucketName,(s3KeyAudio as string) || ""); // delete uploaded song if image upload fails

//       // return NextResponse.json(
//       //   { msg: "Please verify your email address" },
//       //   { status: 400 },
//       // );
//       Uploaderror = { msg: "Please verify your email address", status: 400 };
//     } else if (user.otp !== null) {
//       // await deleteSingleFromS3(bucketName,(s3KeyAudio as string) || ""); // delete uploaded song if image upload fails

//       // return NextResponse.json({ msg: "Please Login" }, { status: 400 });
//       Uploaderror = { msg: "Please login", status: 400 };
//     } else {
//       userArtist = await Artist.findOne({
//         user: userJwt.user,
//         artistName: (artist as string)?.trim(),
//       });
//     }
//     console.log("the user artist ", userArtist, artist);

//     if (Uploaderror != null) {
//       await deleteSingleFromS3(bucketName, (s3KeyAudio as string) || "");
//       return NextResponse.json(
//         { msg: Uploaderror.msg },
//         { status: Uploaderror.status },
//       );
//     } // return any errors up to this point and delete the song

//     if (!userArtist) {
//       await deleteSingleFromS3(bucketName, (s3KeyAudio as string) || ""); // delete uploaded song if image upload fails

//       return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
//     }
//     if (
//       !song_title ||
//       typeof song_title !== "string" ||
//       song_title.length <= 3
//     ) {
//       await deleteSingleFromS3(bucketName, (s3KeyAudio as string) || ""); // delete uploaded song if image upload fails

//       return NextResponse.json(
//         {
//           msg: "Song title is required and must be longer than 3 letters.",
//         },
//         { status: 400 },
//       );
//     }
//     if (actionType === "upload") {
//       if (!uploadId || typeof uploadId != "string") {
//         await deleteSingleFromS3(bucketName, (s3KeyAudio as string) || ""); // delete uploaded song if image upload fails
//         return NextResponse.json(
//           { msg: "uploadId is required." },
//           { status: 400 },
//         );
//       } else {
//         audioTracker = AudioUploadTrackerModel.findOne({
//           _id:uploadId,
//           s3Key: s3KeyAudio,
//           user: user!._id,
//           status: "PENDING",
//         });
//       }
//       if (audioTracker == null ){
//         await deleteSingleFromS3(bucketName, (s3KeyAudio as string) || ""); // delete uploaded song if image upload fails
//         return NextResponse.json({msg:"Invaild Request,please upload audio"},{status:400})
//       }
//       //pre order date is derived from release date
//       if (
//         (release_date != undefined && typeof release_date == "string") ||
//         typeof release_date == "number"
//       ) {
//         oneWeek = subWeeks(new Date(release_date), 1);
//       }
//       if (containsEmoji(song_title)) {
//               Uploaderror = { msg: "Song title can not contain emojis", status: 400 };
//         // return NextResponse.json(
//         //   {
//         //     msg: "Song title can not contain emojis",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (
//         !genre ||
//         typeof genre != "string" ||
//         !genreList.includes(genre)
//       ) {
//                       Uploaderror = { msg: "Genre is required.", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Genre is required.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (
//         !language ||
//         typeof language != "string" ||
//         !languagesList.includes(language)
//       ) {
//                       Uploaderror = { msg: "Language is required", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "language is required.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (!artist || typeof artist != "string") {
//                               Uploaderror = { msg: "Artist is required", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Artist is required.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (
//         !song_writer ||
//         !(song_writer instanceof Array) ||
//         song_writer.some((artist) => artist.first_name === "") ||
//         song_writer.some((artist) => artist.last_name === "")
//       ) {
//                               Uploaderror = { msg: "Song writer is required", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Song Writer is required.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (
//         !producer ||
//         !(producer instanceof Array) ||
//         producer.some((artist) => artist.first_name === "") ||
//         producer.some((artist) => artist.last_name === "")
//       ) {
//                               Uploaderror = { msg: "Producer is required", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Producer is required.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (
//         !performer ||
//         !(performer instanceof Array) ||
//         performer.some((artist) => artist.name === "") ||
//         performer.some((artist) => artist.role === "")
//       ) {
//                               Uploaderror = { msg: "Performer is required", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Performer is required.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (!release_date) {
//                               Uploaderror = { msg: "Release Date is required", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Release Date is required.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (
//         typeof release_date != "string" ||
//         new Date(release_date) < twoWeeks
//       ) {
//                               Uploaderror = { msg: "Release Date must be plus 2 weeks ahead of upload date.", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Release Date must be plus 2 weeks ahead of upload date. ",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (!(territories instanceof Array) || territories.length <= 0) {
//                               Uploaderror = { msg: "Please Select Territories.", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Please select territories.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (pre_order_check && preOrderDate === undefined) {
//                               Uploaderror = { msg: "Pre order Date is required", status: 400 };

//         return NextResponse.json(
//           {
//             msg: "Pre order Date is required.",
//           },
//           { status: 400 },
//         );
//       } else if (
//         pre_order_check === "true" &&
//         (!(preOrderDate instanceof Date) ||
//           (oneWeek && preOrderDate! >= oneWeek))
//       ) {
//                               Uploaderror = { msg: "Pre order Date must be 1 week from the release date.", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Pre Order Date must be 1 week from release date.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (!(dsp instanceof Array) || dsp.length <= 0) {
//                               Uploaderror = { msg: "Please Select a Dsp.", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Please select a Dsp.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (
//         !start_clip ||
//         typeof start_clip != "string" ||
//         !numRegex.test(start_clip)
//       ) {
//                               Uploaderror = { msg: "Start Clip is required.", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Start Clip is required.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (another_distribution_check === "true" && isrc === "") {
//                               Uploaderror = { msg: "ISRC is required when transferring from another distributor.", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "ISRC is required when transferring from another distributor.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (copyRightHolder === "" || copyRightYear === "") {
//                               Uploaderror = { msg: "Copy write year and Copy write holder is required", status: 400 };

//         // return NextResponse.json(
//         //   {
//         //     msg: "Copy Right Holder and Copy Right Year is required.",
//         //   },
//         //   { status: 400 },
//         // );
//       } else if (!music_image || !(music_image instanceof File)) {
//                               Uploaderror = { msg: "Release Image is required and must be a file.", status: 400 };

//         // return NextResponse.json({
//         //   msg: "Music image is required and must be a file",
//         // });
//       } else if (!upc || typeof upc !== "string") {
//                               Uploaderror = { msg: "UPC is required", status: 400 };

//         // return NextResponse.json({
//         //   msg: "upc is required and must be a string",
//         // });
//       } else if (!s3KeyAudio || typeof s3KeyAudio !== "string") {
//                               Uploaderror = { msg: "Uploaded Song is required", status: 400 };

//         // return NextResponse.json({
//         //   msg: "Uploaded Song is required.",
//         // });
//       } else if (!["image/jpeg", "image/png"].includes(music_image.type)) {
//                               Uploaderror = { msg: "Invalid image format", status: 400 };

//         // return NextResponse.json({ msg: "Invalid image format" });
//       }

//       const buffer = Buffer.from(await (music_image as File).arrayBuffer());
//       // ---- Resize to distributor standard ----
//       const resized = await sharp(buffer)
//         .resize(3000, 3000, { fit: "cover" })
//         .jpeg({ quality: 90 })
//         .toBuffer(); //resize the image for dpm

//       const imageType = music_image.type.split("/")[1]; //get the image extension

//       const imageStorageLocation = `testing/${upc}/${upc}.${imageType}`; //reconstruct the s3 key for the image using the upc as the name and adding the jpg extension

//       const imageUrl = await uploadImage(
//         imageType,
//         resized as Buffer<ArrayBuffer>,
//         imageStorageLocation,
//       ); //send image to aws

//       if (imageUrl.coverUrl == null) {
//         await deleteSingleFromS3(bucketName, s3KeyAudio); // delete uploaded song if image upload fails
//         return NextResponse.json({ msg: imageUrl.error }, { status: 500 });
//       }

//       await dbConnect();

//       const savedSong = new SongModel({
//         songTitle: song_title,
//         genre: genre,
//         songLanguage: language,
//         song_writer: song_writer,
//         producer: producer,
//         performer: performer,
//         featured_artist,
//         pre_order_check,
//         another_distribution_check,
//         explicitContent,
//         release_date,
//         preOrderDate: preOrderDate == "undefined" ? null : preOrderDate,
//         copyRightHolder,
//         copyRightYear,
//         lyrics,
//         start_clip,
//         dsp: dsp,
//         upc,
//         isrc: "isrc" + Date.now(),
//         territories: territories,
//         song_audio: s3KeyAudio,
//         song_image: imageUrl.coverUrl,
//         artistName: userArtist.artistName,
//         artist: userArtist._id,
//         user: user!._id,
//       });
//       await savedSong.save();
//     } else {
//       const saveDraft = new SongDraftModel({
//         songTitle: song_title,
//         genre: genre,
//         songLanguage: language,
//         song_writer: song_writer,
//         producer: producer,
//         performer: performer,
//         featured_artist,
//         pre_order_check,
//         another_distribution_check,
//         explicitContent,
//         release_date: release_date == "undefined" ? null : release_date,
//         preOrderDate: preOrderDate == "undefined" ? null : preOrderDate,
//         copyRightHolder,
//         copyRightYear,
//         lyrics,
//         start_clip,
//         dsp: dsp,
//         upc,
//         isrc: "isrc",
//         territories: territories,
//         artistName: userArtist.artistName,
//         artist: userArtist._id,
//         user: user!._id,
//       });
//       await saveDraft.save();
//     }

//     return NextResponse.json({ msg: "success" }, { status: 200 });
//   } catch (error: unknown) {
//     console.log(error);

//     return handleMongooseValidationError(error);
//   }
// }


export async function GET(req: Request) {
  try {
    let songs: any[] = [];
    let totalCount = 0;
    await dbConnect();
    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const sort = searchParams.get("sort") || "-createdAt";
    const songTitle = searchParams.get("songTitle");
    const artist = searchParams.get("artist");
    const songStatusFilter = searchParams.get("songStatusFilter");
    const sortQuery = buildSort(sort) as {
      [key: string]: SortOrder | { $meta: any };
    }; //this is use to format the sort query for mongodb.
    const limit = parseInt(searchParams.get("limit") || "10", 10);


    const query: any = {
      user: userJwt.user,
    };
    if (songStatusFilter && songStatusFilter !== "all") {
      query.releaseStatus = songStatusFilter;
    }
    if (artist) query.artistName = artist;
    if (songTitle?.trim()) {
      query.releaseTitle = { $regex: `^${songTitle}`, $options: "i" };
    }

    songs = await SongModel.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "label")
      .populate("artist", "artistName")
      .lean()
    // .explain("executionStats");
    // const exec = await SongModel.find(query)
    //   .collation({ locale: "en", strength: 2 })
    //   .sort(sortQuery)
    //   .skip((page - 1) * limit)
    //   .limit(limit).explain("executionStats");

    totalCount = await SongModel.countDocuments(query);
    console.log("song filters", songStatusFilter);

    return NextResponse.json(
      {
        data: songs,
        page,
        // exec,
        // skip: (page - 1) * limit,
        // sort,
        // limit,
        // hasNextPage: songs.length === limit,
        totalCount: totalCount,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
        msg: totalCount > 0 ? "Successful" : "No songs found",
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

export async function DELETE(req: Request) {
  // return NextResponse.json({ msg: "Not Available at this time, please try again later" }, { status: 400 });

  try {
    let release: any = null;
    const formData = await req.json();
    if (formData.releaseTitle.trim() === "" || !formData.releaseTitle) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }
    if (formData.artist_name.trim() === "" || !formData.artist_name) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }
    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    await dbConnect();
    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid User" }, { status: 401 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 401 },
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 401 });
    } else {
      // Find and verify release belongs to user before deleting
      release = await SongModel.findOne({
        user: user._id,
        artistName: formData.artist_name.trim(),
        releaseTitle: formData.releaseTitle,
      });

      if (!release) {
        return NextResponse.json(
          {
            msg: "Invalid Release",
          },
          { status: 400 },
        );
      }

      if (release.releaseStatus === "pending" || release.releaseStatus === "rejected") {

        const isSongDeleted = await deleteMultipleFromS3(bucketName, [
          release.releaseAudio,
          release.releaseImage.split("com/")[1], // extract the s3 key from the url
        ]);

        if (isSongDeleted) {
          const session = await mongoose.startSession();
          try {
            session.startTransaction();
            const deleteSongsResult = await SongModel.findByIdAndDelete({
              _id: release._id,
            }).session(session);
            await AudioUploadTrackerModel.findOneAndDelete({
              upc: release.upc,
            }).session(session);
            if (deleteSongsResult.deletedCount < 1) {
              return NextResponse.json(
                { msg: "Failed to delete." },
                { status: 400 },
              );
            }
            await session.commitTransaction();
          } catch (error) {
            if (session.inTransaction()) {
              await session.abortTransaction();
            } console.log("Transaction error:", error);
            return NextResponse.json({ msg: "Failed to delete song" }, { status: 500 });
          } finally {
            await session.endSession();
          }
          return NextResponse.json({ msg: "Song Deleted" }, { status: 200 });
        } else {
          return NextResponse.json(
            { msg: "failed to delete song" },
            { status: 400 },
          );
        }
      } else if (release.releaseStatus === "draft") {
        const deleteSongsResult = await SongModel.findByIdAndDelete({
          _id: release._id,
        });

        if (deleteSongsResult.deletedCount < 1) {
          return NextResponse.json(
            { msg: "Failed to delete." },
            { status: 400 },
          );
        }
        return NextResponse.json({ msg: "Song Deleted" }, { status: 200 });
      }
      return NextResponse.json(
        { msg: "Approved songs cannot be deleted!" },
        { status: 400 },
      );
    }
  } catch (error: unknown) {
    console.log("song delete error", error);

    return handleMongooseValidationError(error);
  }
}

export async function PUT(req: Request) {
  try {
    let userArtist = null;
    let release = null;
    let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
    let audioTracker = null;
    const formData = await req.formData();
    console.log({ ...formData });

    const payload = parseSongFormData(formData);

    if (!payload) {
      return NextResponse.json({ msg: "Invalid form data" }, { status: 400 });
    }

    if (
      !payload.artist ||
      payload.artist.trim() === "" ||
      typeof payload.artist !== "string"
    ) {
      return NextResponse.json({ msg: "Artist is required" }, { status: 400 });
    }

    await dbConnect();

    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      Uploaderror = { msg: "Invalid Request", status: 404 };
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 400 };
    } else if (user.otp !== null) {
      Uploaderror = { msg: "Please login", status: 400 };
    }
    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    } // return any errors up to this point and delete the song

    const isSongValid = validateNonDraftSongs(payload);
    if (isSongValid != null) {
      return NextResponse.json({ msg: isSongValid }, { status: 400 });
    }

    if (payload.uploadId) {
      audioTracker = await AudioUploadTrackerModel.findOne({
        _id: payload.uploadId,
        s3Key: payload.s3KeyAudio,
        user: user!._id,
        status: "PENDING",
      }).lean();

      if (audioTracker == null) {
        return NextResponse.json(
          { msg: "Invaild Request,please upload audio" },
          { status: 400 },
        );
      }
    }

    const userArtistQuery = Artist.findOne({
      user: userJwt.user,
      artistName: (payload.artist as string)?.trim(),
    }).lean();

    const releaseQuery = SongModel.findOne({
      upc: payload.upc,
    }).lean();

    [userArtist, release] = await Promise.all([
      userArtistQuery, releaseQuery
    ]).catch(err => { throw err; });

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }

    if (!release) {
      return NextResponse.json({ msg: "Invalid Release" }, { status: 400 });
    } else if (release.releaseStatus === "approved") {
      return NextResponse.json({ msg: "Approved Releases cannot be edited." }, { status: 400 });
    } else if (release.user.toString() !== user!._id.toString()) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 403 });
    } else if (release.releaseTitle != payload.title) {
      const checkReleaseTitle = await SongModel.find({
        user: user!._id,
        artistName: userArtist.artistName,
        releaseTitle: payload.title
      }).lean();
      if (checkReleaseTitle.length > 0) {
        return NextResponse.json(
          { msg: "Release title already exists" },
          { status: 400 },
        );
      }
    }

    if (!payload.featured_artist) {
      payload.featured_artist = [];
    }


    let imageUrl: {
      error: string | null;
      coverUrl: string | null;
    } = {
      error: null,
      coverUrl: null,
    };

    if (payload.musicImage && payload.musicImage instanceof File) {
      try {
        const buffer = Buffer.from(await payload.musicImage.arrayBuffer());
        // ---- Resize to distributor standard ----
        const resized = await sharp(buffer)
          .resize(3000, 3000, { fit: "cover" })
          .jpeg({ quality: 90 })
          .toBuffer(); //resize the image for dpm
        console.log("buffer", resized);

        const imageType = payload.musicImage.type.split("/")[1]; //get the image extension

        const imageStorageLocation = `testing/${payload.upc}/${payload.upc}.${imageType}`; //reconstruct the s3 key for the image using the upc as the name and adding the jpg extension

        imageUrl = await uploadImage(
          imageType,
          resized as Buffer<ArrayBuffer>,
          imageStorageLocation,
        ); //send image to aws

        if (imageUrl.coverUrl == null) {
          // await deleteSingleFromS3(bucketName, payload.s3KeyAudio! as string); // delete uploaded song if image upload fails
          return NextResponse.json({ msg: imageUrl.error }, { status: 400 });
        }
      } catch (error) {
        console.log("upload image error", error);
      }
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await SongModel.findByIdAndUpdate(
        { _id: release._id },
        {
          releaseTitle: payload.title,
          releaseImage: imageUrl.coverUrl || payload.oldImage,
          releaseAudio: payload.s3KeyAudio || payload.oldAudio,
          genre: payload.genre,
          releaseLanguage: payload.language,
          songWriter: payload.song_writer,
          producer: payload.producer,
          performer: payload.performer,
          featuredArtist: payload.featured_artist,
          preOrderCheck: isDateInPast(new Date(payload.releaseDate!)) ? false : payload.preOrderCheck,
          anotherDistributionCheck: payload.anotherDistributionCheck,
          explicitContent: payload.explicitContent,
          releaseDate:
            user!.type === "EMERGING_ARTIST"
              ? addWeeks(new Date(), 2)
              : payload.releaseDate,
          preOrderDate:
            payload.preOrderDate == "undefined" ? null : isDateInPast(new Date(payload.releaseDate!)) ? null : payload.preOrderDate,
          copyRightHolder:
            user!.type === "EMERGING_ARTIST"
              ? "Distributed by SoundMac"
              : payload.copyRightHolder,
          copyRightYear: user!.type === "EMERGING_ARTIST"
            ? new Date().getFullYear()
            : payload.copyRightYear,
          lyrics: payload.lyrics,
          startClip: payload.startClip,
          dsp: payload.dsp,
          // upc: payload.upc,
          // isrc: payload.isrc,
          territories: payload.territories,
          artistName: userArtist.artistName,
          artist: userArtist._id,
          user: user!._id,
          releaseStatus: "pending",
        },
        { runValidators: true },
      ).session(session);

      if (payload.uploadId) {
        await AudioUploadTrackerModel.findOneAndUpdate(
          {
            _id: payload.uploadId,
            s3Key: payload.s3KeyAudio,
            user: user!._id,
            status: "PENDING",
          },
          { status: "ACTIVE" },
        ).session(session);
      }
      await session.commitTransaction();
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      } console.log("transaction error", error);
      return NextResponse.json({ msg: "Failed to update release" }, { status: 400 });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({ msg: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}

// old methods
// export async function GET(req: Request) {
//   try {
//     let songs: songFromApi[] = [];
//     let totalCount = 0;
//     await dbConnect();
//     const userData = await verifyJWT();
//     const userJwt = verifyUser(userData);

//     if (userJwt.msg) {
//       return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
//     }
//     const { searchParams } = new URL(req.url);
//     console.log(searchParams);

//     const page = parseInt(searchParams.get("page") || "1", 10);
//     const sort = searchParams.get("sort") || "createdAt";
//     const songTitle = searchParams.get("songTitle");
//     const songStatusFilter = searchParams.get("songStatusFilter");
//     const sortQuery = buildSort(sort) as {
//       [key: string]: SortOrder | { $meta: any };
//     }; //this is use to format the sort query for mongodb.
//       const startIndex = (page - 1) * limit;
//       const endIndex = startIndex + limit;
//     if (songTitle && songTitle.trim() !== "") {
//       const query = {
//         songTitle: { $regex: "^" + songTitle, $options: "i" },
//         artist: userJwt.user,
//       };

//       songs = await SongModel.find(query)
//         .collation({ locale: "en", strength: 2 })
//         .sort(sortQuery)
//         .skip((page - 1) * limit)
//         .limit(limit);
//       const startIndex = (page - 1) * limit;
//       const endIndex = startIndex + limit;
//       let sortedSongs: songFromApi[] = [...mockSongs]; // clone first
//       const isDesc = sort.startsWith("-");

//       if (sort.includes("createdAt")) {
//         sortedSongs.sort((a, b) => {
//           const dateA = new Date(a.createdAt).getTime();
//           const dateB = new Date(b.createdAt).getTime();
//           return isDesc ? dateB - dateA : dateA - dateB;
//         });
//       }

//       if (sort.includes("songTitle")) {
//         sortedSongs.sort((a, b) => {
//           return isDesc
//             ? b.songTitle.localeCompare(a.songTitle)
//             : a.songTitle.localeCompare(b.songTitle);
//         });
//       }
//       songs = sortedSongs.slice(startIndex, endIndex);
//       totalCount = mockSongs.length;
//       // totalCount = await Artist.countDocuments(query);
//       // return NextResponse.json({artists,msg:artists.  > 0?"Successful":"No artists found" }, { status:artists.length > 0? 200 : 404 });
//     } else {
//       // artists = await Artist.find({ user: userJwt.user })
//       //   .collation({ locale: "en", strength: 2 })
//       //   .sort(sortQuery)
//       //   .skip((page - 1) * limit)
//       //   .limit(limit);

//       let sortedSongs = [...mockSongs]; // clone first
//       const isDesc = sort.startsWith("-");

//       if (sort.includes("createdAt")) {
//         sortedSongs.sort((a, b) => {
//           const dateA = new Date(a.createdAt).getTime();
//           const dateB = new Date(b.createdAt).getTime();
//           return isDesc ? dateB - dateA : dateA - dateB;
//         });
//       }

//       if (sort.includes("songTitle")) {
//         sortedSongs.sort((a, b) => {
//           return isDesc
//             ? b.songTitle.localeCompare(a.songTitle)
//             : a.songTitle.localeCompare(b.songTitle);
//         });
//       }
//       totalCount = mockSongs.length;
//       // totalCount = await Artist.countDocuments({ user: userJwt.user });
//       // totalCount = 0;
//       // artists = [];
//     }
//     // console.log(songStatusFilter);
//     console.log("typerrre", typeof songStatusFilter);
//     if (songStatusFilter && songStatusFilter !== "all") {
//       songs = songs.filter((item) => item.songStatus === songStatusFilter);
//       totalCount = songs.length
//     }
//           songs = sortedSongs.slice(startIndex, endIndex);

//     console.log("the songs", songs);

//     return NextResponse.json(
//       {
//         data: songs,
//         page,
//         skip: (page - 1) * limit,
//         sort,
//         limit,
//         hasNextPage: songs.length === limit,
//         totalCount: totalCount,
//         totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
//         msg: totalCount > 0 ? "Successful" : "No songs found",
//       },
//       { status: 200 }
//     );
//     // const artists = await Artist.find({ user: userJwt.user }).populate("user", "email").sort({[sort]:1}).skip((page - 1) * limit).limit(limit);
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return NextResponse.json({ msg: error.message }, { status: 500 });
//     } else {
//       return NextResponse.json(
//         { msg: "An unknown error occurred" },
//         { status: 500 }
//       );
//     }
//   }
// }
// export const uploadImage = async (file: File,upc:string): Promise<{msg:string|null,coverUrl:string|null}> => {
//   // ---- Validation ----
//   if (!["image/jpeg", "image/png"].includes(file.type)) {
//     return { msg: "Invalid image format",coverUrl:null };
//   }

//   const buffer = Buffer.from(await file.arrayBuffer());

//   // ---- Resize to distributor standard ----
//   const resized = await sharp(buffer)
//     .resize(3000, 3000, { fit: "cover" })
//     .jpeg({ quality: 90 })
//     .toBuffer();

//   const key = `soundmac4/testing/${upc}.jpg`;

//   await s3.send(
//     new PutObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET!,
//       Key: key,
//       Body: resized,
//       ContentType: "image/jpeg",
//       ACL: "public-read", // OK for cover art
//     })
//   );
//   return { msg: null, coverUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` };
// }
