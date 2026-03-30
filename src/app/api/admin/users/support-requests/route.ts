import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import mongoose, { Types } from "mongoose";
import User from "@/util/models/userModel";
import supportRequestsModel from "@/util/models/supportRequestsModel";

export async function GET(req: Request) {
  try {
    let supportRequests = [];
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
    const { searchParams } = new URL(req.url);
    // console.log(searchParams);

    const cursor = searchParams.get("cursor");

    const supportStatus = searchParams.get("supportStatus");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const query: any = {};

    // If cursor exists, fetch items AFTER it
    if (cursor) {
      query._id = { $lte: new mongoose.Types.ObjectId(cursor) };
    }

    if (supportStatus && supportStatus !== "all") {
      query.issueStatus = supportStatus;
    }
    console.log(query);

    supportRequests = await supportRequestsModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate("user", "email firstName lastName profilePic")
      .lean();

    let nextCursor = null;
    let hasMore = false;

    if (supportRequests.length > limit) {
      hasMore = true;
      const nextItem = supportRequests.pop(); // remove extra
      nextCursor = nextItem!._id;
    }

    return NextResponse.json(
      {
        data: supportRequests,
        nextCursor,
        hasMore,
        msg:
          supportRequests.length > 0
            ? "Successful"
            : "No support requests found",
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

export async function POST(req: Request) {
  try {
    const body: {
      ids: string[];
      newStatus: "pending" | "in-progress" | "completed" | "rejected";
    } = await req.json();
    console.log(body);

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    if (
      !body.ids ||
      !(body.ids instanceof Array) ||
      !body.ids.every((id) => Types.ObjectId.isValid(id))
    ) {
      console.log("one or more invalid ids");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (
      !body.newStatus ||
      !["pending", "in-progress", "completed", "rejected"].includes(
        body.newStatus,
      )
    ) {
      console.log("invalid status");
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    await dbConnect();
    const admin = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!admin) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (admin.role != "admin" && admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    await supportRequestsModel.updateMany(
      { _id: { $in: body.ids } },
      { $set: { issueStatus: body.newStatus } },
      { runValidators: true },
    );
    return NextResponse.json(
      { msg: "Tickets updated successfully." },
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
