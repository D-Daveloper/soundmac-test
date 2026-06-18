import { NextResponse } from "next/server";
import DpmMetaData from "@/util/models/DpmCallBackModel";
import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";

export async function GET(req: Request, { params }: { params: Promise<{ upc: string }> }) {
    const { upc } = await params; // Access the dynamic 'id' parameter
    try {
        const userJwt = await authenticate(req);

        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }
        await dbConnect();

        if (!upc) {
            return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
        }

        // Get audio record from database
        const metaData = await DpmMetaData.find({ upc: upc }).lean();

        if (metaData.length < 1) {
            return NextResponse.json({ msg: "Meta Data not found" }, { status: 400 });
        }
        console.log(metaData);

        return NextResponse.json({
            feed: {
                entry: metaData
            },
            msg: "success",
        });
    } catch (error) {
        console.error("Error song meta data", error);
        return NextResponse.json(
            { error: "Failed fetch meta data" },
            { status: 500 },
        );
    }
}