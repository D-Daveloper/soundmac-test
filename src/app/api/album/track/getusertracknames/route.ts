import { TrackFromApi } from "@/app/type";
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import TrackModel from "@/util/models/trackModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    let totalCount = 0;
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    const artist = searchParams.get("artist");
    const releaseTitle = searchParams.get("release_title");

    const query: any = {
      user: userJwt.user,
      albumName:releaseTitle,
    };

    const tracks = await TrackModel.find(query, {
      releaseTitle: 1,
      _id: 0,
    }).sort({ updatedAt: -1 });
    let releaseTitles: string[] = [];
    if (tracks.length > 0) {
      releaseTitles = tracks.map(
        (s: Pick<TrackFromApi, "releaseTitle">) => s.releaseTitle,
      );
    }
    return NextResponse.json(releaseTitles, { status: 200 });
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
