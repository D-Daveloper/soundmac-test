import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import ChartRegistrationModel from "@/util/models/chartRegistrationModel";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    let charts: any[] = [];
    let totalCount = 0;
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const admin = userJwt.user
      ? await User.findById(userJwt.user).lean()
      : null;
    if (!admin) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (admin.role != "admin" && admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const releaseTitle = searchParams.get("releaseTitle");
    const chartStatus = searchParams.get("chartStatus");
    const chartName = searchParams.get("chartName");

    const query: any = {};

    if (releaseTitle?.trim()) {
      query.releaseTitle = { $regex: `^${releaseTitle}`, $options: "i" };
    }

    if (
      chartStatus?.trim() && chartStatus != "all"
    ) {
      query.chartStatus = chartStatus;
    }

    if (chartName?.trim() && chartName != "all") {
      query.chartSlug = chartName;
    }



    const chartsQuery = ChartRegistrationModel.find(query).populate({ path: "releaseId", select: "releaseTitle releaseImage featuredArtist artistName" }).collation({ locale: "en", strength: 2 })
      // .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const totalCountQuery = ChartRegistrationModel.countDocuments(query);

    [charts, totalCount] = await Promise.all([
      chartsQuery,
      totalCountQuery,
    ]);


    return NextResponse.json(
      {
        data: charts,
        page,
        limit,
        totalCount,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
        msg: totalCount > 0 ? "Successful" : "No Promotions found",
      },
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
