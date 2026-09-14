import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import AlbumModel from "@/util/models/AlbumModel";
import TrackModel from "@/util/models/trackModel";
import { getAlbumPerformanceData } from "../../utils";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // Access the dynamic 'id' parameter
    try {
 // 1. Authenticate JWT using cookies/headers
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    // 2. Call the shared service layer directly
    const result = await getAlbumPerformanceData(id, userJwt.user as string |null);

    // 3. If something went wrong deep in the service layer, forward its status code
    if (result.status !== 200) {
      return NextResponse.json({ msg: result.msg }, { status: result.status });
    }

    // 4. Return successful response payload
    return NextResponse.json({
      release: result.data?.release,
      tracks: result.data?.tracks,
      msg: result.msg,
    });
    } catch (error) {
        console.error("gettin album data", error);
        return NextResponse.json(
            { error: "Failed to Retrieve Album" },
            { status: 500 },
        );
    }
}



