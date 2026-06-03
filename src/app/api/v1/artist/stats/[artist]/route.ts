import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import Artist from "@/util/models/artistModel";
import { authenticate } from "@/util/middleware/authMiddleware";
// import { Artist } from "@/app/type";

export async function GET(req: Request,  context: { params: Promise<{ artist: string }> }) {
  try {
    const { artist } = await context.params;
    let artistNames: any[] = [];
    let mainArtist = null;
    await dbConnect();
    const userJwt = await authenticate(req);
    
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

      mainArtist = await Artist.findOne({user: userJwt.user,artistName:artist}).lean();
      if (!mainArtist) {
        return NextResponse.json({ msg: "Invalid Artist." }, { status: 404 });
      }
      artistNames = await Artist.distinct('artistName',{user: userJwt.user}).sort({createdAt:-1});
    return NextResponse.json(
      {
        artists:artistNames,
        totalReleases:0,
        artist:mainArtist
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ msg: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { msg: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}