import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/util/middleware/aws";
import TrackModel from "@/util/models/trackModel";

export async function GET(req: Request) {
  try {
    // Check admin authorization (adjust to your auth system)
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    let trackId = searchParams.get("trackId");
    if (!trackId || !Types.ObjectId.isValid(trackId)) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }
    // Get audio record from database
    const release = await TrackModel.findById(trackId, {
      releaseTitle: 1,
      releaseAudio: 1,
      trackNumber: 1,
    });
    if (!release || !release.releaseAudio) {
      return NextResponse.json({ msg: "Audio not found" }, { status: 400 });
    }
    console.log(release);
    const fileName = release.releaseTitle + "_" + release.releaseAudio.split("/")[2];

    // Generate presigned URL
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: release.releaseAudio,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });

    const downloadUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({
      downloadUrl,
      fileName,
      expiresIn: 3600,
      msg: "Link generated Successfully.",
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 },
    );
  }
}
