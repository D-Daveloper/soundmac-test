import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import Promotion from "@/util/models/promotionModel";
import { PromotionEmailBody } from "@/app/type";
import {
  promotionApprovalEmail,
  promotionCompletionEmail,
  promotionRejectionEmail,
  replaceTemplatePlaceholders,
} from "@/util/middleware/functions";
import sendEmail from "@/util/sendMail/sendEmail";
import { logAdminActivity } from "@/util/lib/adminActivityLog/adminActivityLogHelper";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ promotionId: string }> },
) {
  try {
    const { promotionId } = await params;

    // Validate input before hitting auth/DB
    if (!promotionId || !Types.ObjectId.isValid(promotionId)) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }

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
    }
    if (admin.role !== "admin" && admin.role !== "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    const promotion = await Promotion.findById(promotionId)
      .lean()
      .populate("artist")
      .populate("user");

    return NextResponse.json({
      ...promotion,
      msg: "Promotion data fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching promotion data:", error);
    return NextResponse.json(
      { msg: "Failed to fetch promotion data." },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ promotionId: string }> },
) {
  const { promotionId } = await params; // Access the dynamic 'id' parameter
  try {
    const body: {
      requestType: "approved" | "rejected" | "completed";
      rejectMessage?: string;
      rejectReason?: string;
    } = await req.json();
    console.log(body);

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    if (!body) {
      console.log("no request body");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (
      body.requestType != "approved" &&
      body.requestType != "rejected" &&
      body.requestType != "completed"
    ) {
      console.log("invalid request type");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (body.requestType == "rejected" && !body.rejectMessage) {
      console.log("no rejection message");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (body.requestType == "rejected" && !body.rejectReason) {
      console.log("no rejection reason");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!promotionId || !Types.ObjectId.isValid(promotionId)) {
      console.log("no id");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    await dbConnect();

    const admin = userJwt.user
      ? await User.findById(userJwt.user).lean()
      : null;
    if (!admin) {
      console.log("not admin");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (admin.role != "admin" && admin.role != "super_admin") {
      console.log("no admin rights");

      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    const promotion = await Promotion.findById(promotionId)
      .lean()
      .populate("user", "email");

    if (!promotion) {
      console.log("no promotion found");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (
      promotion.promotionStatus != "pending" &&
      body.requestType != "completed"
    ) {
      console.log("promotion not pending");
      return NextResponse.json(
        { msg: "Only pending Promotions can be " + body.requestType },
        { status: 400 },
      );
    } else if (
      promotion.promotionStatus != "approved" &&
      body.requestType == "completed"
    ) {
      console.log("promotion not approved");
      return NextResponse.json(
        { msg: "Only approved Promotions can be " + body.requestType },
        { status: 400 },
      );
    }
    let userEmailhtml: string = "";
    let promotionUpdate;
    let endDate = null;
    switch (promotion.category) {
      case "Boomplay":
        endDate = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000);
        break;
      case "Deezer":
        endDate = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000);
        break;
      case "Online-Press":
        endDate = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000); //does not expire
        break;
      case "Shazam":
        endDate = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000);
        break;
      case "Radio-Promotion":
        endDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case "Playlist-Pitch":
        endDate = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000);
        break;
      default:
        endDate = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000);

        break;
    }
    if (body.requestType == "approved") {
      promotionUpdate = Promotion.findByIdAndUpdate(
        promotionId,
        {
          promotionStatus: body.requestType,
          startDate: new Date(),
          endDate,
        },
        { runValidators: true },
      );
      const promotionEmailData: PromotionEmailBody = {
        artist_name: promotion.artistName,
        content_title: promotion.releaseTitle,
        content_type: "Music",
        promotion_type: promotion.category,
        rejection_reason: "promotion.releaseTitle",
        admin_message: "promotion.releaseTitle",
        start_date: new Date().toDateString(),
        end_date:
          promotion.category === "Online-Press"
            ? "Does not expire"
            : endDate.toDateString(),
        rejection_date: promotion.releaseTitle,
        promotion_id: promotion._id.toString(),
        resubmit_url: promotion.releaseTitle,
        guidelines_url: promotion.releaseTitle,
        submission_date: "",
        promotion_url:
          process.env.FRONTEND_URL +
          "/dashboard/explore/promotion?page=myPromotions",
      };

      //send mail here
      userEmailhtml = replaceTemplatePlaceholders(
        promotionApprovalEmail(),
        promotionEmailData,
      );
    } else if (body.requestType == "rejected") {
      const promotionEmailData: PromotionEmailBody = {
        artist_name: promotion.artistName,
        content_title: promotion.releaseTitle,
        content_type: "Music",
        promotion_type: promotion.category,
        rejection_reason: body.rejectReason!,
        admin_message: body.rejectMessage!,
        start_date: new Date().toDateString(),
        end_date:
          promotion.category === "Online-Press"
            ? "Does not expire"
            : endDate.toDateString(),
        rejection_date: promotion.releaseTitle,
        promotion_id: promotion._id.toString(),
        resubmit_url: promotion.releaseTitle,
        guidelines_url: promotion.releaseTitle,
        submission_date: promotion.createdAt.toDateString(),
        promotion_url:
          process.env.FRONTEND_URL +
          "/dashboard/explore/promotion?page=myPromotions",
      };

      //send mail here
      userEmailhtml = replaceTemplatePlaceholders(
        promotionRejectionEmail(),
        promotionEmailData,
      );
    } else if (body.requestType == "completed") {
      promotionUpdate = Promotion.findByIdAndUpdate(
        promotionId,
        {
          promotionStatus: body.requestType,
        },
        { runValidators: true },
      );
      const promotionEmailData: PromotionEmailBody = {
        artist_name: promotion.artistName,
        content_title: promotion.releaseTitle,
        content_type: "Music",
        promotion_type: promotion.category,
        rejection_reason: body.rejectReason!,
        admin_message: body.rejectMessage!,
        start_date: promotion.startDate.toDateString(),
        end_date:
          promotion.category === "Online-Press"
            ? "Does not expire"
            : promotion.endDate.toDateString(),
        rejection_date: promotion.releaseTitle,
        promotion_id: promotion._id.toString(),
        resubmit_url: promotion.releaseTitle,
        guidelines_url: promotion.releaseTitle,
        submission_date: promotion.createdAt.toDateString(),
        promotion_url:
          process.env.FRONTEND_URL +
          "/dashboard/explore/promotion?page=explore",
      };

      //send mail here
      userEmailhtml = replaceTemplatePlaceholders(
        promotionCompletionEmail(),
        promotionEmailData,
      );
    }

    await Promise.all([
      sendEmail(
        promotion.user.email,
        "Promotion " + body.requestType,
        userEmailhtml,
      ),
      promotionUpdate,
    ]).catch((error) => {
      console.error(`failed to ${body.requestType} promotion `, error);

      return NextResponse.json(
        { msg: `Failed to ${body.requestType} promotion. ` },
        { status: 400 },
      );
    });

    await logAdminActivity({
      adminId: admin._id.toString(),
      adminName: `${admin.firstName} ${admin.lastName}`,
      action:
        body.requestType === "approved"
          ? "promotion.approved"
          : body.requestType === "rejected"
            ? "promotion.rejected"
            : "promotion.completed",
      entityType: "promotion",
      entityId: promotionId,
      entityLabel: `${promotion.artistName} — ${promotion.releaseTitle}`,
      metadata:
        body.requestType === "rejected"
          ? { reason: body.rejectReason, message: body.rejectMessage }
          : undefined,
    });

    return NextResponse.json(
      { msg: "Promotion has been" + " " + body.requestType + "." },
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
