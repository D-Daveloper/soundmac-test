import dbConnect from "@/util/db";
import { buildSort } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import withDrawalModel from "@/util/models/withDrawalModel";
import { SortOrder } from "mongoose";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  try {
    let Withdrawals: any[] = [];
    let totalCount = 0;
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const admin = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!admin) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (admin.role != "admin" && admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    let page = parseInt(searchParams.get("page") || "1", 10);
    let withdrawalStatus = searchParams.get("withdrawalStatus") || "all";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const email = searchParams.get("email");
    const sort = searchParams.get("sort") || "-createdAt";
    const sortQuery = buildSort(sort) as {
      [key: string]: SortOrder | { $meta: any };
    }; //this is use to format the sort query for mongodb.

    const query: any = {};

    if (withdrawalStatus === "all") {
      query.withdrawalStatus = "pending";
    }
    // let exec = {};
    console.log("the queries", query);

    // 1. If email filter exists, resolve it to a user _id first
    if (email?.trim()) {
      const user = await User.findOne(
        { email: { $regex: `^${email}`, $options: "i" } },
        { _id: 1 }, // only fetch the id, nothing else
      ).lean();

      if (!user) {
        // No user found, return empty early
        return NextResponse.json(
          {
            data: [],
            page,
            limit,
            totalCount: 0,
            totalPages: 0,
            msg: "No results found",
          },
          { status: 200 },
        );
      }

      query.user = user._id; // inject into withdrawal query
    }

    // 2. Now run the withdrawal query as normal
    Withdrawals = await withDrawalModel
      .find(query)
      .populate("user", "email")
      .collation({ locale: "en", strength: 2 })
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    totalCount = await withDrawalModel.countDocuments(query);

    // console.log("song filters", userStatusFilter);

    return NextResponse.json(
      {
        data: Withdrawals,
        page,
        // exec,
        // skip: (page - 1) * limit,
        // sort,
        // hasNextPage: songs.length === limit,
        limit,
        totalCount: totalCount,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
        msg: totalCount > 0 ? "Successful" : "No Verification requests found",
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
