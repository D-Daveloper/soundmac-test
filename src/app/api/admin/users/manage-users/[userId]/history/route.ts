import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import withDrawalModel from "@/util/models/withDrawalModel";
import mongoose, { Types } from "mongoose";
import User from "@/util/models/userModel";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    // Validate input before hitting auth/DB
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }
    let withdrawals = [];
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const admin = userJwt.user
      ? await User.findById(userJwt.user).lean()
      : null;
    if (!admin) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    }
    if (admin.role !== "admin" && admin.role !== "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    // console.log(searchParams);

    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const query: any = {
      user: userId,
    };

    console.log(query);

    // If cursor exists, fetch items AFTER it
    if (cursor) {
      query._id = { $lte: new mongoose.Types.ObjectId(cursor) };
    }

    withdrawals = await withDrawalModel
      .find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ _id: -1 })
      .limit(limit + 1);

    let nextCursor = null;
    let hasMore = false;

    if (withdrawals.length > limit) {
      hasMore = true;
      const nextItem = withdrawals.pop(); // remove extra
      nextCursor = nextItem._id;
    }

    // console.log("withdrawal filters", withdrawalStatusFilter);

    return NextResponse.json(
      {
        data: withdrawals,
        nextCursor,
        hasMore,
        msg:
          withdrawals.length > 0 ? "Successful" : "No withdrawals found",
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
