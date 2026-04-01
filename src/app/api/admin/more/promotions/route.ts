import dbConnect from "@/util/db";
import { buildSort } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import Promotion, { IPromotion } from "@/util/models/promotionModel";
import User from "@/util/models/userModel";
import { SortOrder } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
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
    const sort = searchParams.get("sort") || "-createdAt";
    const releaseTitle = searchParams.get("releaseTitle");
    const promotionStatus = searchParams.get("promotionStatus");
    const promotionType = searchParams.get("promotionType");

    const sortQuery = buildSort(sort) as {
      [key: string]: SortOrder | { $meta: any };
    }; //this is use to format the sort query for mongodb.

    const query: any = {};

    if (releaseTitle?.trim()) {
      query.releaseTitle = { $regex: `^${releaseTitle}`, $options: "i" };
    }

    if (
      promotionStatus?.trim() &&
      ["pending", "approved", "completed"].includes(promotionStatus)
    ) {
      query.promotionStatus = promotionStatus;
    }

    if (promotionType?.trim() && promotionType != "all") {
      query.category = promotionType;
    }

    const projection = {
      releaseTitle: 1,
      promotionStatus: 1,
      category: 1,
      amount: 1,
      createdAt: 1,
    };

    console.log("the queries", query);

    const promotions = Promotion.find(query, projection)
      .collation({ locale: "en", strength: 2 })
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const totalCount = Promotion.countDocuments(query);
    const totalBoomplay = Promotion.countDocuments({ category: "Boomplay" });
    const totalOnlinePress = Promotion.countDocuments({
      category: "Online-Press",
    });
    const totalRadioPromotion = Promotion.countDocuments({
      category: "Radio-Promotion",
    });
    const totalActivePromotions = Promotion.countDocuments({
      promotionStatus: "approved",
    });
    const totalPromotionsAmount = Promotion.aggregate([
      {
        $group: {
          _id: null, // Group everything together
          totalAmount: { $sum: "$amount" }, // Sum the 'amount' field
        },
      },
    ]);

    const [
      promotionsResult,
      totalCountResult,
      totalBoomplayResult,
      totalOnlinePressResult,
      totalRadioPromotionResult,
      totalActivePromotionsResult,
      totalPromotionsAmountResult,
    ] = await Promise.all([
      promotions,
      totalCount,
      totalBoomplay,
      totalOnlinePress,
      totalRadioPromotion,
      totalActivePromotions,
      totalPromotionsAmount,
    ]);
    // The result is an array: [{ _id: null, totalAmount: 1500 }]
    console.log(totalPromotionsAmountResult);
    
    const result =
      totalPromotionsAmountResult.length > 0
        ? totalPromotionsAmountResult[0].totalAmount
        : 0;

    return NextResponse.json(
      {
        data: promotionsResult,
        page,
        limit,
        totalBoomplay: totalBoomplayResult,
        totalOnlinePress: totalOnlinePressResult,
        totalRadioPromotion: totalRadioPromotionResult,
        totalPromotions:
          totalBoomplayResult +
          totalOnlinePressResult +
          totalRadioPromotionResult,
        totalActivePromotions: totalActivePromotionsResult,
        totalCount: totalCountResult,
        totalPromotionsAmount: result,
        totalPages:
          totalCountResult > 0 ? Math.ceil(totalCountResult / limit) : 0,
        msg: totalCountResult > 0 ? "Successful" : "No Promotions found",
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
