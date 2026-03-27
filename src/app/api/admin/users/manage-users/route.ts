import dbConnect from "@/util/db";
import { buildSort } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User, { IUser } from "@/util/models/userModel";
import { SortOrder } from "mongoose";
import { NextResponse } from "next/server";
const userAccountTypes = [
  "EMERGING_ARTIST",
  "MAJOR_LABEL",
  "FREE_ARTIST",
  "INDEPENDENT_ARTIST",
  "INDIE_LABEL",
];
const userStatusTypes = [
  "active",
  "inactive",
];
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

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    let page = parseInt(searchParams.get("page") || "1", 10);
    const accountType = searchParams.get("accountType");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const sort = searchParams.get("sort") || "-createdAt";
    const name = searchParams.get("name");
    const userStatus = searchParams.get("userStatus");
    const sortQuery = buildSort(sort) as {
      [key: string]: SortOrder | { $meta: any };
    }; //this is use to format the sort query for mongodb.

    const query: any = {
      $or: [{ role: { $ne: "super_admin" } }, { role: { $exists: false } }],
    };
    if (userStatus && userStatusTypes.includes(userStatus)) {
      query.userStatus = userStatus;
    }
    if (accountType && userAccountTypes.includes(accountType)) {
      query.type = accountType;
    }
    if (name?.trim()) {
      query.name = { $regex: `^${name}`, $options: "i" };
      // page = 1;
    }
    const userProjection = {
      firstName: 1,
      lastName: 1,
      email: 1,
      profilePic: 1,
      type: 1,
      userStatus: 1,
      referral_code: 1, // Optional field
      createdAt: 1,
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
        msg: totalCount > 0 ? "Successful" : "No songs found",
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
