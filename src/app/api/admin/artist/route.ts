import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import Artist from "@/util/models/artistModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    let artists: string[] = [];
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

      artists = await Artist.distinct('artistName').sort({createdAt:-1});

    console.log(artists);
    
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