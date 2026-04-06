import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import mongoose from "mongoose";
import User from "@/util/models/userModel";
import Artist from "@/util/models/artistModel";
import Label from "@/util/models/labelModel";

export async function GET(req: Request) {
    try {
        let labels = [];
        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);

        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }

        await dbConnect();

        const admin = userJwt.user ? await User.findById(userJwt.user).lean() : null;
        if (!admin) {
            return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
        } else if (admin.role != "admin" && admin.role != "super_admin") {
            return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
        }
        const { searchParams } = new URL(req.url);
        console.log(searchParams);

        const cursor = searchParams.get("cursor");

        const labelStatus = searchParams.get("labelStatus") || "active";
        const labelName = searchParams.get("labelName");
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const query: any = {
            labelStatus: labelStatus,
        };

        // If cursor exists, fetch items AFTER it
        if (cursor && !labelName) {
            query._id = { $lte: new mongoose.Types.ObjectId(cursor) };
        }
        if (labelName) {
            query.labelName = { $regex: `^${labelName}`, $options: "i" };
        }
        console.log(query);

        labels = await Label.find(query)
            .collation({ locale: "en", strength: 2 })
            .sort({ _id: -1 })
            .limit(limit + 1)
            .populate("user", "email firstName lastName")
            .lean();

        let nextCursor = null;
        let hasMore = false;
        // console.log(labels);

        if (labels.length > limit) {
            hasMore = true;
            const nextItem = labels.pop(); // remove extra
            nextCursor = nextItem!._id;
        }

        const labelsWithArtistCount = [];
        if (labels.length > 0) {
            for (let i = 0; i < labels.length; i++) {
                const artistCount = await Artist.countDocuments({ user: labels[i].user })
                labelsWithArtistCount.push({ ...labels[i], artistCount })
            }
        }
        // console.log(labelsWithArtistCount);

        return NextResponse.json(
            {
                data: labelsWithArtistCount,
                nextCursor,
                hasMore,
                msg: labelsWithArtistCount.length > 0 ? "Successful" : "No labels found",
            },
            { status: 200 },
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ msg: error.message }, { status: 500 });
        } else {
            return NextResponse.json(
                { msg: "An unknown error occurred" },
                { status: 500 },
            );
        }
    }
}
