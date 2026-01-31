import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/util/middleware/aws";
import { getUPCs } from "@/util/middleware/dpm";
import AudioUploadTrackerModel from "@/util/models/AudioUploadTrackerModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import Artist from "@/util/models/artistModel";
import dbConnect from "@/util/db";
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
  
    const { fileType, fileSize, upcFromClient, artist, isFromAnotherDistributor } = body;

    if (!fileType || typeof fileType != "string"){
      return NextResponse.json({msg:"file type is required."},{status:400})
    }else if(!fileSize || typeof fileSize != "number"){
      return NextResponse.json({msg:"file size is required."},{status:400}) 
    }else if(!artist || typeof artist != "string"){
      return NextResponse.json({msg:"artist is required."},{status:400}) 
    }
    let userArtist = null;
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
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
      userArtist = await Artist.findOne({
        user: userJwt.user,
        artistName: (artist as string).trim(),
      });
    }

  
    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }

    if(isFromAnotherDistributor && !upcFromClient)
    {
      return NextResponse.json({ msg: "UPC is required when uploading from another distributor." }, { status: 400 });
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
      upc = await getUPCs();
    }
  
    // ---- 2. Generate S3 key ----
    const s3Key = `testing/${upc}/${upc}.${fileType.split("/")[1]}`;
  
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
    }
    const update ={
      user: user._id,
      artistName: userArtist.artistName,
      artist: userArtist._id,
      s3Key,
      upc,
      status: "PENDING",
    }
    const audioTracker = await AudioUploadTrackerModel.findOneAndUpdate(query, update,   { 
    upsert: true, 
    returnDocument: 'after'  // Returns the document after the update
  });//saved the document so you can track whether or not the upload succeeds to prevent orphaned uploaded songs in the s3 bucket

    // ---- 4. Return ONLY what client needs ----
    return NextResponse.json({
      uploadUrl,
      s3Key,
      upcFromServer: upc,
      uploadId: audioTracker._id,//id of the new created docment
    });
    
  } catch (error) {
    console.log("getting signed url error:",error);
    
    return NextResponse.json({msg:"Error getting signed url."},{status:500})
  }
}

export async function PUT(req: Request) {
  const body = await req.json();

  const { fileType, fileSize } = body;

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
