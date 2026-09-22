// POST /v1/uploads/sign-part

import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import { s3 } from "@/util/middleware/aws";
import AudioUploadTrackerModel from "@/util/models/AudioUploadTrackerModel";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// body: { uploadTrackerId, partNumber }
export async function POST(req: Request) {
  await dbConnect();
  const { uploadTrackerId, partNumber } = await req.json();
  const userJwt = await authenticate(req);
  if (userJwt.msg) return NextResponse.json({ msg: userJwt.msg }, { status: 401 });

  const tracker = await AudioUploadTrackerModel.findById(uploadTrackerId);
  if (!tracker || String(tracker.user) !== String(userJwt.user)) {
    return NextResponse.json({ msg: "Invalid upload" }, { status: 404 });
  }

  const command = new UploadPartCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: tracker.s3Key,
    UploadId: tracker.s3UploadId,
    PartNumber: partNumber,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });

  return NextResponse.json({ url });
}