import dbConnect from "@/util/db";
import AlbumModel from "@/util/models/AlbumModel";
import TrackModel from "@/util/models/trackModel";
import User from "@/util/models/userModel";
import { Types } from "mongoose";

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