// POST /v1/uploads/initiate

import { albumFromApi } from "@/app/type";
import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import AlbumModel from "@/util/models/AlbumModel";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";
import { s3 } from "@/util/middleware/aws";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import AudioUploadTrackerModel from "@/util/models/AudioUploadTrackerModel";

// body: { upcFromClient, trackNumber, fileType, fileSize }
export async function POST(req: Request) {
  await dbConnect();
  const { upcFromClient, trackNumber, fileType, fileSize } = await req.json();

  const userJwt = await authenticate(req);
  if (userJwt.msg) return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
  const user = await User.findById(userJwt.user);
  if (!user) return NextResponse.json({ msg: "User unauthorized." }, { status: 404 });

  const userAlbum = await AlbumModel.findOne({ upc: upcFromClient })
    .lean<albumFromApi>();
  if (!userAlbum || String(userAlbum.user) !== String(user._id)) {
    return NextResponse.json({ msg: "Invalid upc" }, { status: 400 });
  } else if (userAlbum.releaseStatus === "inactive") {
    return NextResponse.json({ msg: "Album not found." }, { status: 404 });
  }

  // Atomically claim the track number so two concurrent requests can't grab the same one
  const claimedAlbum = await AlbumModel.findOneAndUpdate(
    { upc: upcFromClient },
    { $pull: { unassignedNumbers: trackNumber } },
    { new: false },
  );

  if (!claimedAlbum) {
    return NextResponse.json({ msg: "Track number already taken" }, { status: 409 });
  }
  const upc = userAlbum.upc;
  const partSize = 8 * 1024 * 1024; // 8MB
  const totalParts = Math.ceil(fileSize / partSize);

  const existing = await AudioUploadTrackerModel.findOne({
    user: user._id,
    upc,
    trackNumber,
    status: "UPLOADING",
  });

  if (existing) {
    return NextResponse.json({
      uploadTrackerId: existing._id,
      s3UploadId: existing.s3UploadId,
      s3key: existing.s3Key,
      upc,
      partSize,
      totalParts: existing.totalParts,
      uploadedParts: existing.uploadedParts, // resume point
    });
  }
  const s3key = `NewReleases/${upc}/${upc}_01_${trackNumber}.flac`;

  const created = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3key,
      ContentType: fileType,
    }),
  );


  const tracker = await AudioUploadTrackerModel.findOneAndUpdate(
    { user: user._id, upc, s3Key: s3key },
    {
      user: user._id,
      artist: userAlbum.artist,
      s3Key: s3key,
      upc,
      trackNumber,
      s3UploadId: created.UploadId,
      totalParts,
      uploadedParts: [],
      status: "UPLOADING",
    },
    { upsert: true, new: true },
  );

  return NextResponse.json({
    uploadTrackerId: tracker._id,
    s3UploadId: created.UploadId,
    s3key,
    upc,
    partSize,
    totalParts,
    uploadedParts: tracker.uploadedParts, // lets client skip parts on resume
  });
}