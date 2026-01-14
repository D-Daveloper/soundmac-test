import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import Artist, { IArtist } from "@/util/models/artistModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
// import { Artist } from "@/app/type";

export async function GET(req: Request,  context: { params: Promise<{ artist: string }> }) {
  try {
    const { artist } = await context.params;
    let artists: IArtist[] = [];
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

      artists = await Artist.find({user: userJwt.user});
      if (!artists || artists.length === 0) {
        return NextResponse.json({ msg: "No artists found" }, { status: 404 });
      }
      const artistNames = artists.map(artist=>artist.artistName);
      const mainArtist = artists.filter((art)=>art.artistName===artist);
    return NextResponse.json(
      {
        artists:artistNames,
        totalReleases:0,
        artist:mainArtist[0]||null
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