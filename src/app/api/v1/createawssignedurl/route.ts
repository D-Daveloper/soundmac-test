import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/util/middleware/aws";
import AudioUploadTrackerModel from "@/util/models/AudioUploadTrackerModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import Artist from "@/util/models/artistModel";
import dbConnect from "@/util/db";
import AlbumModel from "@/util/models/AlbumModel";
import { getYearRange } from "@/util/middleware/functions";
import SongModel from "@/util/models/songModel";
import { generateUPC } from "@/services/dsp/dsp.service";
import { Types } from "mongoose";
import { authenticate } from "@/util/middleware/authMiddleware";
import { albumFromApi } from "@/app/type";
import { requireActiveSubscription } from "@/util/middleware/subscription";
// import { v4 as uuid } from "uuid";

/**
 * This endpoint:
 * - Validates the upload request
 * - Generates a signed S3 upload URL
 * - NEVER handles file bytes
 */
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      fileType,
      fileSize,
      upcFromClient,
      artist,
      isFromAnotherDistributor,
      releaseId
    } = body;

    if (!fileType || typeof fileType != "string") {
      return NextResponse.json(
        { msg: "file type is required." },
        { status: 400 },
      );
    } else if (!fileSize || typeof fileSize != "number") {
      return NextResponse.json(
        { msg: "file size is required." },
        { status: 400 },
      );
    } else if (!artist || typeof artist != "string") {
      return NextResponse.json({ msg: "artist is required." }, { status: 400 });
    }
    let userArtist = null;
    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 404 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 400 },
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 400 });
    }
    //  else if (user.premium !== true) {
    //   return NextResponse.json(
    //     { msg: "Please upgrade your account." },
    //     { status: 402 },
    //   );
    // } else if (user.premium && new Date() > new Date(user.premiumExpiration!)) {
    //   user.premium = false;
    //   user.premiumExpiration = null;
    //   await user.save();
    //   return NextResponse.json(
    //     { msg: "Please upgrade your account." },
    //     { status: 402 },
    //   );
    // } 
    else {
       const subError = requireActiveSubscription(user);
  if (subError) {
    return NextResponse.json({ msg: subError.msg }, { status: subError.status });
  }
      userArtist = await Artist.findOne({
        user: userJwt.user,
        artistName: (artist as string).trim(),
      }).lean();
    }

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }

    if (releaseId && Types.ObjectId.isValid(releaseId)) {
      const song = await SongModel.findById(releaseId);
      if (song && song.releaseStatus === 'approved') {
        return NextResponse.json({ msg: "Approved Releases cannot be Edited." }, { status: 400 })
      }
    }

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

    if (isFromAnotherDistributor && !upcFromClient) {
      return NextResponse.json(
        { msg: "UPC is required when uploading from another distributor." },
        { status: 400 },
      );
    }

    let upc = upcFromClient;

    // ---- 1. Validate file ----
    const allowedAudioTypes = ["audio/wav", "audio/flac", "audio/mpeg"];

    if (!allowedAudioTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "Unsupported audio format" },
        { status: 400 },
      );
    }

    const MAX_SIZE = 200 * 1024 * 1024; // 200MB
    if (fileSize > MAX_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    if (!upc) {
      upc = await generateUPC();
    }

    // ---- 2. Generate S3 key ----
    // const s3Key = `NewReleases/${upc}/${upc}.${fileType.split("/")[1]}`;
    const s3Key = `NewReleases/${upc}/${upc}_01_01.flac`;

    // ---- 3. Create signed URL ----
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 180,
    });
    const query = {
      user: user._id,
      s3Key,
      upc,
    };
    const update = {
      user: user._id,
      artistName: userArtist.artistName,
      artist: userArtist._id,
      s3Key,
      upc,
      status: "PENDING",
    };
    const audioTracker = await AudioUploadTrackerModel.findOneAndUpdate(
      query,
      update,
      {
        upsert: true,
        returnDocument: "after", // Returns the document after the update
      },
    ); //saved the document so you can track whether or not the upload succeeds to prevent orphaned uploaded songs in the s3 bucket

    // ---- 4. Return ONLY what client needs ----
    return NextResponse.json({
      uploadUrl,
      s3Key,
      upcFromServer: upc,
      uploadId: audioTracker._id, //id of the new created docment
    });
  } catch (error) {
    console.log("getting signed url error:", error);

    return NextResponse.json(
      { msg: "Error getting signed url." },
      { status: 500 },
    );
  }
}

//for track
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { fileType, fileSize, upcFromClient, track_number } = body;
    // console.log(body);

    if (!fileType || typeof fileType != "string") {
      return NextResponse.json(
        { msg: "file type is required." },
        { status: 400 },
      );
    } else if (!fileSize || typeof fileSize != "number") {
      return NextResponse.json(
        { msg: "file size is required." },
        { status: 400 },
      );
    }
    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 404 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 400 },
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 400 });
    } else {
       const subError = requireActiveSubscription(user);
  if (subError) {
    return NextResponse.json({ msg: subError.msg }, { status: subError.status });
  }
    }

    // else if (user.premium !== true) {
    //   return NextResponse.json(
    //     { msg: "Please upgrade your account." },
    //     { status: 402 },
    //   );
    // } else if (user.premium && new Date() > new Date(user.premiumExpiration!)) {
    //   user.premium = false;
    //   user.premiumExpiration = null;
    //   await user.save();
    //   return NextResponse.json(
    //     { msg: "Please upgrade your account." },
    //     { status: 402 },
    //   );
    // }
    if (user!.type === "EMERGING_ARTIST") {
      return NextResponse.json(
        { msg: "Emerging artists can not upload track" },
        { status: 403 },
      );
    }

    if (!upcFromClient) {
      return NextResponse.json({ msg: "UPC is required." }, { status: 400 });
    }

    const userAlbum = await AlbumModel.findOne({ upc: upcFromClient }).lean<albumFromApi>();

    if (!userAlbum) {
      return NextResponse.json({ msg: "Invalid upc" }, { status: 400 });
    }

    if (String(userAlbum.user) !== String(user._id)) {
      return NextResponse.json({ msg: "Invalid Album" }, { status: 400 });
    }

    let upc = userAlbum.upc;

    // ---- 1. Validate file ----
    const allowedAudioTypes = ["audio/wav", "audio/flac", "audio/mpeg"];

    if (!allowedAudioTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "Unsupported audio format" },
        { status: 400 },
      );
    }

    const MAX_SIZE = 200 * 1024 * 1024; // 200MB
    if (fileSize > MAX_SIZE) {
      return NextResponse.json({ msg: "File too large" }, { status: 400 });
    }

    if (!track_number || !userAlbum.unassignedNumbers.includes(track_number)) {
      return NextResponse.json(
        { msg: "track_number required." },
        { status: 400 },
      );
    }
    const s3key = `NewReleases/${upc}/${upc}_01_${track_number}.flac`;
    // const s3key = `NewReleases/${upc}/${upc}_01_${track_number}.${fileType.split("/")[1]}`;

    // ---- 3. Create signed URL ----
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 180,
    });

    const query = {
      user: user._id,
      s3Key: s3key,
      upc,
    };

    const update = {
      user: user._id,
      artistName: userAlbum.artistName,
      artist: userAlbum.artist,
      s3Key: s3key,
      upc,
      status: "PENDING",
    };

    const audioTracker = await AudioUploadTrackerModel.findOneAndUpdate(
      query,
      update,
      {
        upsert: true,
        returnDocument: "after", // Returns the document after the update
      },
    ); //saved the document so you can track whether or not the upload succeeds to prevent orphaned uploaded songs in the s3 bucket

    // ---- 4. Return ONLY what client needs ----
    return NextResponse.json({
      uploadUrl,
      s3key,
      upcFromServer: upc,
      uploadId: audioTracker._id, //id of the new created docment
    });
  } catch (error) {
    console.log("getting signed url error:", error);

    return NextResponse.json(
      { msg: "Error getting signed url." },
      { status: 500 },
    );
  }
}




// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const s3Client = new S3Client({ region: "us-east-1" });

// // Express.js route handler
// app.post("/api/get-upload-urls", async (req, res) => {
//   const { files } = req.body; // Expecting an array: [{ name: "a.png", type: "image/png" }]
  
//   try {
//     const urlPromises = files.map(async (file) => {
//       const command = new PutObjectCommand({
//         Bucket: "your-unique-bucket-name",
//         Key: `uploads/${Date.now()}_${file.name}`,
//         ContentType: file.type, // Forces client to match this file type
//       });

//       // Generate a URL that expires in 15 minutes (900 seconds)
//       const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
      
//       return { fileName: file.name, uploadUrl: url };
//     });

//     const presignedUrls = await Promise.all(urlPromises);
//     res.json({ urls: presignedUrls });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to generate URLs" });
//   }
// });


// async function uploadMultipleFiles(fileList) {
//   // 1. Prepare payload for your backend API
//   const filesMetadata = Array.from(fileList).map(file => ({
//     name: file.name,
//     type: file.type
//   }));

//   // 2. Request the unique presigned URLs from your server
//   const response = await fetch("/api/get-upload-urls", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ files: filesMetadata })
//   });
//   const { urls } = await response.json();

//   // 3. Execute all uploads concurrently straight to S3
//   const uploadPromises = urls.map(async (item, index) => {
//     const targetFile = fileList[index];

//     return fetch(item.uploadUrl, {
//       method: "PUT",
//       headers: { "Content-Type": targetFile.type },
//       body: targetFile
//     });
//   });

//   await Promise.all(uploadPromises);
//   alert("All files uploaded successfully!");
// }
