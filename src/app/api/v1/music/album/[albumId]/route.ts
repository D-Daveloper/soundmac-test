import dbConnect from "@/util/db";
import { inngest } from "@/util/lib/inngest/inngest";
import { authenticate } from "@/util/middleware/authMiddleware";
import AlbumModel from "@/util/models/AlbumModel";
import TrackModel from "@/util/models/trackModel";
import User from "@/util/models/userModel";
import { Types } from "mongoose";
import { NextResponse } from "next/server";


export async function GET(req: Request, { params }: { params: Promise<{ albumId: string }> }) {
    const { albumId } = await params; // Access the dynamic 'id' parameter
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

        if (!albumId || !Types.ObjectId.isValid(albumId)) {
            return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
        }

        // Get audio record from database
        const releaseQuery = AlbumModel.findOne({ user: user._id, _id: albumId }).select("-artistName").populate("artist", " artistName spotifyId appleId -_id").lean();
        const tracksQuery = TrackModel.find({ user: user._id, album: albumId }).lean();

        const [release, tracks] = await Promise.all([releaseQuery, tracksQuery]);

        if (!release) {
            return NextResponse.json({ msg: "Audio not found" }, { status: 404 });
        }
        // console.log(release);

        return NextResponse.json({
            release,
            tracks,
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

export async function DELETE(req: Request, { params }: { params: Promise<{ albumId: string }> }) {
    const { albumId } = await params; // Access the dynamic 'id' parameter
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
            release = await AlbumModel.findOne({
                user: user._id,
                _id: albumId
            }).lean();

            const tracks = await TrackModel.find({ user: user._id, album: albumId }).lean();

            if (!release) {
                return NextResponse.json(
                    {
                        msg: "Invalid Release",
                    },
                    { status: 404 },
                );
            }

            if (release.releaseStatus === "pending") {

                await inngest.send({
                    name: "delete/album",
                    data: {
                        albumId: release._id,
                        s3Keys: [
                            release.releaseImage.split("com/")[1],
                            ...tracks.map((t: any) => t.releaseAudio)
                        ]
                    }
                });
            } else if (release.releaseStatus === "draft") {
                const deleteSongsResult = await AlbumModel.findByIdAndDelete({
                    _id: release._id,
                });

                if (deleteSongsResult.deletedCount < 1) {
                    return NextResponse.json(
                        { msg: "Failed to delete." },
                        { status: 400 },
                    );
                }
                return NextResponse.json({ msg: "Album Deleted" }, { status: 200 });
            }
            return NextResponse.json(
                { msg: "Approved albums cannot be deleted!" },
                { status: 400 },
            );
        }
    } catch (error: unknown) {
        console.log("album delete error", error);
        return NextResponse.json(
            { msg: "Failed to Delete Album." },
            { status: 400 },
        );
    }
}