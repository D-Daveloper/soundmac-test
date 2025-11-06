import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const artistData = {
      pendingRelease: {
        artist: "David",
        image: "/dashboardart.png",
        name: "Low Tides & Fame Life",
      },
      streams: "8000",
      totalSongs: "1000",
      totalEarnings: 10000000,
      lastRelease: {
        artist: "David",
        image: "/lastrelease.png",
        name: "Low Tides & Fame Life",
      },
    };

    return NextResponse.json(
      { ...artistData, msg: "Successful" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
    // const artists = await Artist.find({ user: userJwt.user }).populate("user", "email").sort({[sort]:1}).skip((page - 1) * limit).limit(limit);
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
