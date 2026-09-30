// POST /v1/uploads/initiate

import { albumFromApi } from "@/app/type";
import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import AlbumModel from "@/util/models/AlbumModel";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";
import { s3 } from "@/util/middleware/aws";
import { CreateMultipartUploadCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import AudioUploadTrackerModel from "@/util/models/AudioUploadTrackerModel";
import { requireActiveSubscription } from "@/util/middleware/subscription";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// body: { upcFromClient, trackNumber, fileType, fileSize }
// export async function POST(req: Request) {
//   await dbConnect();
//   const { upcFromClient, trackNumber, fileType, fileSize } = await req.json();

//   const userJwt = await authenticate(req);
//   if (userJwt.msg) return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
//   const user = await User.findById(userJwt.user);
//   if (!user) return NextResponse.json({ msg: "User unauthorized." }, { status: 404 });

//   const userAlbum = await AlbumModel.findOne({ upc: upcFromClient })
//     .lean<albumFromApi>();
//   if (!userAlbum || String(userAlbum.user) !== String(user._id)) {
//     return NextResponse.json({ msg: "Invalid upc" }, { status: 400 });
//   } else if (userAlbum.releaseStatus === "inactive") {
//     return NextResponse.json({ msg: "Album not found." }, { status: 404 });
//   }

//   // Atomically claim the track number so two concurrent requests can't grab the same one
//   const claimedAlbum = await AlbumModel.findOneAndUpdate(
//     { upc: upcFromClient },
//     { $pull: { unassignedNumbers: trackNumber } },
//     { new: false },
//   );

//   if (!claimedAlbum) {
//     return NextResponse.json({ msg: "Track number already taken" }, { status: 409 });
//   }
//   const upc = userAlbum.upc;
//   const partSize = 8 * 1024 * 1024; // 8MB
//   const totalParts = Math.ceil(fileSize / partSize);

//   const existing = await AudioUploadTrackerModel.findOne({
//     user: user._id,
//     upc,
//     trackNumber,
//     status: "UPLOADING",
//   });

//   if (existing) {
//     return NextResponse.json({
//       uploadTrackerId: existing._id,
//       s3UploadId: existing.s3UploadId,
//       s3key: existing.s3Key,
//       upc,
//       partSize,
//       totalParts: existing.totalParts,
//       uploadedParts: existing.uploadedParts, // resume point
//     });
//   }
//   const s3key = `NewReleases/${upc}/${upc}_01_${trackNumber}.flac`;

//   const created = await s3.send(
//     new CreateMultipartUploadCommand({
//       Bucket: process.env.AWS_S3_BUCKET!,
//       Key: s3key,
//       ContentType: fileType,
//     }),
//   );


//   const tracker = await AudioUploadTrackerModel.findOneAndUpdate(
//     { user: user._id, upc, s3Key: s3key },
//     {
//       user: user._id,
//       artist: userAlbum.artist,
//       s3Key: s3key,
//       upc,
//       trackNumber,
//       s3UploadId: created.UploadId,
//       totalParts,
//       uploadedParts: [],
//       status: "UPLOADING",
//     },
//     { upsert: true, new: true },
//   );

//   return NextResponse.json({
//     uploadTrackerId: tracker._id,
//     s3UploadId: created.UploadId,
//     s3key,
//     upc,
//     partSize,
//     totalParts,
//     uploadedParts: tracker.uploadedParts, // lets client skip parts on resume
//   });
// }

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { fileType, fileSize, upc, trackNumber, replace } = body;
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

    if (user!.type === "EMERGING_ARTIST") {
      return NextResponse.json(
        { msg: "Emerging artists can not upload track" },
        { status: 403 },
      );
    }

    if (!upc) {
      return NextResponse.json({ msg: "UPC is required." }, { status: 400 });
    }

    const userAlbum = await AlbumModel.findOne({ upc: upc }).populate("artist", "artistName").lean<albumFromApi>();

    if (!userAlbum) {
      return NextResponse.json({ msg: "Invalid upc" }, { status: 400 });
    }

    if (String(userAlbum.user) !== String(user._id)) {
      return NextResponse.json({ msg: "Invalid Album" }, { status: 400 });
    }

    // let upc = userAlbum.upc;

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
    const num = parseInt(userAlbum.numberOfTracks, 10);
    const trackNumbers = Array.from({ length: num }, (_, i) => (i + 1).toString());

    console.log(trackNumbers);

    if (!trackNumber || !trackNumbers.includes(trackNumber)) {
      console.log(trackNumber);

      return NextResponse.json(
        { msg: "track number required." },
        { status: 400 },
      );
    }
    // POST /v1/uploads
    const EXT_BY_TYPE: Record<string, string> = {
      "audio/flac": "flac",
      "audio/x-flac": "flac",
      "audio/wav": "wav",
      "audio/mpeg": "mp3",
    };

    const ext = EXT_BY_TYPE[fileType];
    if (!ext) {
      return NextResponse.json(
        { code: "UNSUPPORTED_FORMAT", msg: "Unsupported audio format" },
        { status: 400 },
      );
    }

    const s3key = `NewReleases/${upc}/${upc}_01_${trackNumber}.flac`;

    // Already finished for this track number? Don't silently overwrite it.
    const existingTracker = await AudioUploadTrackerModel.findOne({
      user: user._id,
      upc,
      trackNumber,
    });

    if (existingTracker?.status === "COMPLETED" && !replace) {
      return NextResponse.json(
        { code: "TRACK_ALREADY_UPLOADED", msg: "Audio already uploaded for this track number" },
        { status: 409 },
      );
    }

    // Idempotent: same user + upc + trackNumber returns the same tracker with a fresh URL
    const tracker = await AudioUploadTrackerModel.findOneAndUpdate(
      { user: user._id, upc, trackNumber }, // no longer restricted to PENDING/FAILED
      {
        user: user._id,
        artist: userAlbum.artist._id,
        artistName: userAlbum.artist.artistName,
        s3Key: s3key,
        upc,
        trackNumber,
        fileSize,
        fileType,
        status: "PENDING",
        errorReason: null,
      },
      { upsert: true, new: true },
    );

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3key,
        ContentType: fileType,
      }),
      { expiresIn: 900 }, // 15 min: long enough for a 100MB file on a slow line
    );

    return NextResponse.json({
      uploadId: tracker._id,
      uploadUrl,
      s3key,
      requiredHeaders: { "Content-Type": fileType }, // integrators must send exactly this
      expiresInSeconds: 900,
    });
  } catch (error) {
    console.log("getting signed url error:", error);

    return NextResponse.json(
      { msg: "Error getting signed url." },
      { status: 500 },
    );
  }
}

