import { nextReleases } from "@/app/utils/constants";
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const userData = await verifyJWT();

    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();
    const user = await User.findById(userJwt.user);
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json(
        { msg: "Unauthorized for this action" },
        { status: 403 },
      );
    }
    const dashboardDate = {
      totalRelease: 3000,
      totalApprovedReleases: 1500,
      totalRejectedReleases: 500,
      totalPendingReleases: 1000,
      totalUsers: 4000,
      totalArtists: 3000,
      totalSupportRequests: 200,
      totalEarnings: 40000000,
      upomingReleases: nextReleases,
    };

    return NextResponse.json(
      { ...dashboardDate, msg: "Successful" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      },
    );
    // const artists = await Artist.find({ user: userJwt.user }).populate("user", "email").sort({[sort]:1}).skip((page - 1) * limit).limit(limit);
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
