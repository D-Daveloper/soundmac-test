import dbConnect from "@/util/db";
import { s3 } from "@/util/middleware/aws";
import AudioUploadTrackerModel, { AudioTrackType } from "@/util/models/AudioUploadTrackerModel";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// POST /v1/uploads/complete
// body: { uploadTrackerId }
export async function POST(req: Request) {
    await dbConnect();
    const { uploadTrackerId } = await req.json();

    let tracker: AudioTrackType | null = null;

    tracker = await AudioUploadTrackerModel.findById(uploadTrackerId);
    if (!tracker) return NextResponse.json({ msg: "Audio tracker not found." }, { status: 404 });

    const parts = tracker.uploadedParts
        .sort((a, b) => a.partNumber - b.partNumber)
        .map((p) => ({ ETag: p.etag, PartNumber: p.partNumber }));

    await s3.send(
        new CompleteMultipartUploadCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: tracker.s3Key,
            UploadId: tracker.s3UploadId!,
            MultipartUpload: { Parts: parts },
        }),
    );

    await AudioUploadTrackerModel.findByIdAndUpdate(uploadTrackerId, {
        status: "COMPLETED",
    });

    return NextResponse.json({ ok: true });
}