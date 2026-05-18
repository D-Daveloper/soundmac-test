import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import AlbumModel from "@/util/models/AlbumModel";
import TrackModel from "@/util/models/trackModel";

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


// Define strict return types for your service
interface AlbumServiceResult {
  status: number;
  msg: string;
  data?: {
    release: any;
    tracks: any[];
  };
}
export async function getAlbumPerformanceData(
  albumId: string,
  userId: string | null
): Promise<AlbumServiceResult> {
  // 1. Validate ObjectId structure
  if (!albumId || !Types.ObjectId.isValid(albumId)) {
    return { status: 400, msg: "Invalid Request" };
  }

  // 2. Connect to Database
  await dbConnect();

  // 3. Verify user existence
  const user = userId ? await User.findById(userId).lean() : null;
  if (!user) {
    return { status: 404, msg: "Invalid Request." };
  }

  // 4. Fetch Album
  const projection = {
    releaseTitle: 1,
    releaseImage: 1,
    artistName: 1,
  };
  const release = await AlbumModel.findById(albumId, projection).lean();

  if (!release) {
    return { status: 404, msg: "Album not found" };
  }

  // 5. Fetch Tracks
  const tracks = await TrackModel.find(
    { album: albumId },
    { trackNumber: 1, releaseTitle: 1, featuredArtist: 1 }
  ).lean();

  return {
    status: 200,
    msg: "",
    data: { release, tracks },
  };
}