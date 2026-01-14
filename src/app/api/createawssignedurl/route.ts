import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/util/middleware/aws";
import { getUPCs } from "@/util/middleware/dpm";
// import { v4 as uuid } from "uuid";

/**
 * This endpoint:
 * - Validates the upload request
 * - Generates a signed S3 upload URL
 * - NEVER handles file bytes
 */
export async function POST(req: Request) {
  const body = await req.json();

  const { fileType, fileSize,upcFromClient } = body;
  let upc = upcFromClient;

  // ---- 1. Validate file ----
  const allowedAudioTypes = [
    "audio/wav",
    "audio/flac",
    "audio/mpeg",
  ];

  if (!allowedAudioTypes.includes(fileType)) {
    return NextResponse.json(
      { error: "Unsupported audio format" },
      { status: 400 }
    );
  }

  const MAX_SIZE = 200 * 1024 * 1024; // 200MB
  if (fileSize > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large" },
      { status: 400 }
    );
  }
  if (!upc){
      upc = await getUPCs();
  }

  // ---- 2. Generate S3 key ----
  const s3Key = `testing/${upc}/${upc}.${fileType.split("/")[1]}`;

  // ---- 3. Create signed URL ----
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: s3Key,
    ContentType: fileType,
  //     // Add these metadata for CORS
  // Metadata: {
  //   'Access-Control-Allow-Origin': '*'
  // }

  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  // ---- 4. Return ONLY what client needs ----
  return NextResponse.json({
    uploadUrl,
    s3Key,
    upcFromServer:upc,
  });
}

export async function PUT(req: Request) {
  const body = await req.json();

  const { fileType, fileSize } = body;

  // ---- 1. Validate file ----
  const allowedAudioTypes = [
    "audio/wav",
    "audio/flac",
    "audio/mpeg",
  ];

  if (!allowedAudioTypes.includes(fileType)) {
    return NextResponse.json(
      { error: "Unsupported audio format" },
      { status: 400 }
    );
  }

  const MAX_SIZE = 200 * 1024 * 1024; // 200MB
  if (fileSize > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large" },
      { status: 400 }
    );
  }

  // ---- 2. Generate S3 key ----
  const s3Key = `uploads/tracks/${"uuid()"}`;

  // ---- 3. Create signed URL ----
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: s3Key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  // ---- 4. Return ONLY what client needs ----
  return NextResponse.json({
    uploadUrl,
    s3Key,
  });
}
