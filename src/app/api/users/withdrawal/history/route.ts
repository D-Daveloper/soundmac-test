import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { buildSort } from "@/util/middleware/functions";
import withDrawalModel from "@/util/models/withDrawalModel";
import mongoose, { SortOrder } from "mongoose";

const limit = parseInt("3", 10);

export async function GET(req: Request) {
  try {
    let withdrawals = [];
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    // console.log(searchParams);

    const cursor = searchParams.get("cursor");
    const sort = searchParams.get("sort") || "createdAt";
    const artist = searchParams.get("artist");
    const range = searchParams.get("period") || "all";
    const withdrawalStatusFilter = searchParams.get("withdrawalStatusFilter") || "all";
    const sortQuery = buildSort(sort) as {
      [key: string]: SortOrder | { $meta: any };
    }; //this is use to format the sort query for mongodb.

    const query: any = {
      user: userJwt.user,
    };
    /* ---------------- DATE FILTER ---------------- */

    const now = new Date();

    if (range === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);

      query.createdAt = { $gte: oneWeekAgo };
    }

    if (range === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      query.createdAt = { $gte: oneMonthAgo };
    }

    if (range === "3months") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);

      query.createdAt = { $gte: threeMonthsAgo };
    }
    console.log(query);
    

    // If cursor exists, fetch items AFTER it
    if (cursor) {
      query._id = { $lte: new mongoose.Types.ObjectId(cursor) };
    }

    if (withdrawalStatusFilter && withdrawalStatusFilter !== "all") {
      query.withdrawalStatus = withdrawalStatusFilter;
    }

    if (artist) query.artistName = artist;

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
          withdrawals.length > 0 ? "Successful" : "No songswithdrawals found",
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
