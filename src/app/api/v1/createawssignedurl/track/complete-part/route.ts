// POST /v1/uploads/complete-part  (called by client right after each part PUT succeeds,

import dbConnect from "@/util/db";
import AudioUploadTrackerModel from "@/util/models/AudioUploadTrackerModel";
import { NextResponse } from "next/server";

// so progress survives even if the browser closes before the whole file finishes)
export async function POST(req: Request) {
  await dbConnect();
  const { uploadTrackerId, partNumber, etag } = await req.json();

  await AudioUploadTrackerModel.updateOne(
    { _id: uploadTrackerId },
    { $addToSet: { uploadedParts: { partNumber, etag } } },
  );

  return NextResponse.json({ ok: true });
}