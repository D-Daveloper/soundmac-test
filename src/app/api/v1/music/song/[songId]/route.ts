import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import { deleteMultipleFromS3 } from "@/util/middleware/aws";
import AudioUploadTrackerModel from "@/util/models/AudioUploadTrackerModel";
import SongModel from "@/util/models/songModel";
import User from "@/util/models/userModel";
import mongoose, { Types } from "mongoose";
import { NextResponse } from "next/server";

const bucketName = process.env.AWS_S3_BUCKET!;

export async function GET(req: Request, { params }: { params: Promise<{ songId: string }> }) {
    const { songId } = await params; // Access the dynamic 'id' parameter
    try {
        // Check admin authorization (adjust to your auth system)
        const userJwt = await authenticate(req);

        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }
        await dbConnect();

        const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
        if (!user) {
            return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
        }

        if (!songId || !Types.ObjectId.isValid(songId)) {
            return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
        }

        // Get audio record from database
        const release = await SongModel.findById(songId).select("-artistName").populate("artist", "artistName spotifyId appleId -_id").lean();

        if (!release) {
            return NextResponse.json({ msg: "Audio not found" }, { status: 404 });
        } else if (release.user.toString() !== user._id.toString()) {
            return NextResponse.json({ msg: "Unauthorized" }, { status: 403 });
        }
        // console.log(release);

        return NextResponse.json({
            release,
            msg: "success",
        });
    } catch (error) {
        console.error("getsingle details:", error);
        return NextResponse.json(
            { error: "Failed to get release details." },
            { status: 500 },
        );
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ songId: string }> }) {
    const { songId } = await params; // Access the dynamic 'id' parameter
    try {
        let release: any = null;

        const userJwt = await authenticate(req);

        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }

        await dbConnect();
        const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
        if (!user) {
            return NextResponse.json({ msg: "Invalid User" }, { status: 401 });
        } else if (!user.confirmed) {
            return NextResponse.json(
                { msg: "Please verify your email address" },
                { status: 401 },
            );
        } else if (user.otp !== null) {
            return NextResponse.json({ msg: "Please Login" }, { status: 401 });
        } else {
            // Find and verify release belongs to user before deleting
            release = await SongModel.findOne({
                user: user._id,
                _id: songId
            }).lean();

            if (!release) {
                return NextResponse.json(
                    {
                        msg: "Invalid Release",
                    },
                    { status: 400 },
                );
            }

            if (release.releaseStatus === "pending" || release.releaseStatus === "rejected") {
                const isSongDeleted = await deleteMultipleFromS3(bucketName, [
                    release.releaseAudio,
                    release.releaseImage.split("com/")[1],
                ]);
                if (isSongDeleted === 2) {
                    const session = await mongoose.startSession();
                    try {
                        session.startTransaction();
                        const deleteSongsResult = await SongModel.findByIdAndDelete({
                            _id: release._id,
                        }, { session });
                        await AudioUploadTrackerModel.findOneAndDelete({
                            upc: release.upc,
                        }, { session });
                        await session.commitTransaction();
                        if (deleteSongsResult.deletedCount < 1) {
                            return NextResponse.json(
                                { msg: "Failed to delete." },
                                { status: 400 },
                            );
                        }
                        return NextResponse.json({ msg: "Song Deleted" }, { status: 200 });

                    } catch (error) {
                        console.log(error);

                        await session.abortTransaction();
                        return NextResponse.json(
                            { msg: "Failed to delete." },
                            { status: 400 },
                        );

                    } finally {
                        await session.endSession()
                    }
                } else {
                    return NextResponse.json(
                        { msg: "failed to delete song" },
                        { status: 400 },
                    );
                }
            } else if (release.releaseStatus === "draft") {
                const deleteSongsResult = await SongModel.findByIdAndDelete({
                    _id: release._id,
                });

                if (deleteSongsResult.deletedCount < 1) {
                    return NextResponse.json(
                        { msg: "Failed to delete." },
                        { status: 400 },
                    );
                }
                return NextResponse.json({ msg: "Song Deleted" }, { status: 200 });
            }
            return NextResponse.json(
                { msg: "Approved songs cannot be deleted!" },
                { status: 400 },
            );
        }
    } catch (error: unknown) {
        console.log("song delete error", error);
        return NextResponse.json(
            { msg: "Failed to Delete Song." },
            { status: 400 },
        );
    }
}