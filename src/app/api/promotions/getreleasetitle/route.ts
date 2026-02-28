import { albumFromApi, songFromApi } from "@/app/type";
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import SongModel from "@/util/models/songModel";
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
    // if (!artist) {
    //   return NextResponse.json(
    //     { msg: "Artist parameter is required" },
    //     { status: 400 },
    //   );
    // }
    const query: any = {
      user: userJwt.user,
      artistName: artist,
    };

    const songs = await SongModel.find(query, { releaseTitle: 1, _id: 0 }).sort(
      { updatedAt: -1 },
    );
    const albums = await AlbumModel.find(query, {
      releaseTitle: 1,
      _id: 0,
    }).sort({ updatedAt: -1 });

    totalCount = songs.length + albums.length;
    let releaseTitles: string[] = [];
    if (songs.length > 0) {
      releaseTitles = songs.map(
        (s: Pick<songFromApi, "releaseTitle">) => s.releaseTitle,
      );
    }
    if (albums.length > 0) {
      releaseTitles = [
        ...releaseTitles,
        ...albums.map((a: Pick<albumFromApi, "releaseTitle">) => a.releaseTitle),
      ];
    }
    return NextResponse.json(
      
        releaseTitles,
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
