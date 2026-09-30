import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import { s3 } from "@/util/middleware/aws";
import { requireActiveSubscription } from "@/util/middleware/subscription";
import AudioUploadTrackerModel, { AudioTrackType } from "@/util/models/AudioUploadTrackerModel";
import User from "@/util/models/userModel";
import { CompleteMultipartUploadCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// POST /v1/uploads/complete
// body: { uploadTrackerId }
export async function POST(req: Request) {
    await dbConnect();
    const { uploadId } = await req.json();
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

    const tracker = await AudioUploadTrackerModel.findById(uploadId);
    if (!tracker || String(tracker.user) !== String(user._id)) {
        return NextResponse.json({ code: "UPLOAD_NOT_FOUND", msg: "Upload not found" }, { status: 404 });
    }
    if (tracker.status === "COMPLETED") {
        return NextResponse.json({ ok: true, s3key: tracker.s3Key }); // idempotent
    }

    try {
        const head = await s3.send(
            new HeadObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: tracker.s3Key }),
        );

        const MAX_SIZE = 200 * 1024 * 1024;
        if ((head.ContentLength ?? 0) > MAX_SIZE || head.ContentLength !== tracker.fileSize) {
            await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: tracker.s3Key }));
            tracker.status = "FAILED";
            tracker.errorReason = "Size mismatch";
            await tracker.save();
            return NextResponse.json({ code: "SIZE_MISMATCH", msg: "Uploaded file size doesn't match" }, { status: 400 });
        }
    } catch {
        return NextResponse.json(
            { code: "FILE_NOT_FOUND", msg: "File not found in storage. Upload it first." },
            { status: 400 },
        );
    }

    tracker.status = "COMPLETED";
    await tracker.save();
    return NextResponse.json({ ok: true, s3key: tracker.s3Key });
}

// export async function POST(req: Request) {
//     await dbConnect();
//     const { uploadTrackerId } = await req.json();

//     let tracker: AudioTrackType | null = null;

//     tracker = await AudioUploadTrackerModel.findById(uploadTrackerId);
//     if (!tracker) return NextResponse.json({ msg: "Audio tracker not found." }, { status: 404 });

//     const parts = tracker.uploadedParts
//         .sort((a, b) => a.partNumber - b.partNumber)
//         .map((p) => ({ ETag: p.etag, PartNumber: p.partNumber }));

//     await s3.send(
//         new CompleteMultipartUploadCommand({
//             Bucket: process.env.AWS_S3_BUCKET!,
//             Key: tracker.s3Key,
//             UploadId: tracker.s3UploadId!,
//             MultipartUpload: { Parts: parts },
//         }),
//     );

//     await AudioUploadTrackerModel.findByIdAndUpdate(uploadTrackerId, {
//         status: "COMPLETED",
//     });

//     return NextResponse.json({ ok: true });
// }