import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import ChartRegistrationModel from "@/util/models/chartRegistrationModel";
import { logAdminActivity } from "@/util/lib/adminActivityLog/adminActivityLogHelper";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chartId: string }> },
) {
  const { chartId } = await params; // Access the dynamic 'id' parameter
  try {
    const body: {
      requestType: "approved";
    } = await req.json();
    console.log(body);

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    if (!body) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (body.requestType != "approved") {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!chartId || !Types.ObjectId.isValid(chartId)) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }
    const chart = await ChartRegistrationModel.findById(chartId).lean();

    if (!chart) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (chart.chartStatus != "pending") {
      return NextResponse.json(
        { msg: "Only pending charts can be " + body.requestType },
        { status: 400 },
      );
    }

    await ChartRegistrationModel.findByIdAndUpdate(chartId, {
      chartStatus: body.requestType,
    });

    await logAdminActivity({
      adminId: user._id.toString(),
      adminName: `${user.firstName} ${user.lastName}`,
      action: "chart.approved",
      entityType: "chart",
      entityId: chartId,
      entityLabel: chart.releaseTitle ?? chartId,
    });

    return NextResponse.json(
      { msg: "Chart" + " " + body.requestType + "." },
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chartId: string }> },
) {
  const { chartId } = await params; // Access the dynamic 'id' parameter
  try {
    // Check admin authorization (adjust to your auth system)
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    if (!chartId || !Types.ObjectId.isValid(chartId)) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }

    const chart = await ChartRegistrationModel.findById(chartId)
      .populate({
        path: "releaseId",
        select: "releaseTitle releaseImage featuredArtist upc isrc",
      })
      .populate("artist")
      .lean();

    if (!chart) {
      return NextResponse.json({ msg: "Chart not found" }, { status: 400 });
    }
    console.log(chart);

    return NextResponse.json({
      ...chart,
      msg: "Chart fetched Successfully.",
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 },
    );
  }
}
