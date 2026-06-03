import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import Artist from "@/util/models/artistModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    let artists: string[] = [];
    await dbConnect();
    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    artists = await Artist.distinct('artistName', { user: userJwt.user, artistStatus: "active" }).sort({ createdAt: -1 });

    return NextResponse.json(
      artists
      ,
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