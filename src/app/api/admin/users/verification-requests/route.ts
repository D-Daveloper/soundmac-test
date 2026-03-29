import dbConnect from "@/util/db";
import { buildSort } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User, { IUser } from "@/util/models/userModel";
import { SortOrder } from "mongoose";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  try {
    let users: IUser[] = [];
    let totalCount = 0;
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const admin = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!admin) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (admin.role != "admin" && admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    let page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const sort = searchParams.get("sort") || "-createdAt";
    const sortQuery = buildSort(sort) as {
      [key: string]: SortOrder | { $meta: any };
    }; //this is use to format the sort query for mongodb.

    const query: any = {
      "verificationDetails.verified": "pending",
    };

    const userProjection = {
      firstName: 1,
      lastName: 1,
      email: 1,
      profilePic: 1,
      verificationDetails: 1,
    };
    // let exec = {};
    console.log("the queries", query);

    users = await User.find(query, userProjection)
      .collation({ locale: "en", strength: 2 })
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit);
    totalCount = await User.countDocuments(query);

    // console.log("song filters", userStatusFilter);

    return NextResponse.json(
      {
        data: users,
        page,
        // exec,
        // skip: (page - 1) * limit,
        // sort,
        limit,
        // hasNextPage: songs.length === limit,
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
