import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import SongModel from "@/util/models/songModel";
import Artist from "@/util/models/artistModel";
import UserNotification from "@/util/models/userNotification";
import { DetactivateEmail, sendUserNotificationEmailType } from "@/app/type";
import { sendUserNotificationEmail, userDeactivationEmail } from "@/util/middleware/functions";
import sendEmail from "@/util/sendMail/sendEmail";
import EntityDeactivation from "@/util/models/deactivateEntity";
import salesReportLedger from "@/util/models/saleReportLedgerModel";
import mongoose from "mongoose";
import salesReport from "@/util/models/salesReportModel";

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

    const userProjection = {
      firstName: 1,
      lastName: 1,
      email: 1,
      profilePic: 1,
      type: 1,
      referral_code: 1, // Optional field
      country: 1,
      updatedAt: 1,
      accountDetails: 1,
      verificationDetails: 1,
      subscriptionDetails: 1,
      label: 1,
      createdAt: 1,
    };

    const user = User.findById(userId, userProjection).lean();
    const allArtists = Artist.find(
      { user: userId },
      { artistImage: 1, artistName: 1 },
    ).lean();
    const songCount = SongModel.countDocuments({ user: userId });


    const [userResult, allArtistsResult, SongCountResult, totalEarnings, earningsArray,totalSales] = await Promise.all([
      user,
      allArtists,
      songCount,
      //total net amount
      salesReportLedger.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalNetAmount: {
              $sum: {
                $cond: [
                  { $eq: ["$direction", "credit"] },
                  { $toDouble: "$amountUsd" },
                  { $multiply: [{ $toDouble: "$amountUsd" }, -1] }
                ]
              }
            },
          }
        }
      ]),
      salesReport.find({ user: userId },{trackTitle:1,trackArtistRaw:1,netAmountUsd: 1,upc:1,dsp:1,territory:1,}).lean(),
      salesReport.countDocuments({ user: userId }),
      
    ]);
    console.log(totalEarnings)
    return NextResponse.json({
      data: userResult,
      artists: allArtistsResult,
      songCount: SongCountResult,
      totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].totalNetAmount : 0,
      earningsArray,
      msg: "User data fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { msg: "Failed to fetch user data." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params; // Access the dynamic 'id' parameter
  try {
    const body: {
      userType: string;
    } = await req.json();
    console.log(body);

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    if (!userId || !Types.ObjectId.isValid(userId)) {
      console.log("no userId");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body) {
      console.log("no request body");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body.userType) {
      console.log("no user type from client");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    const admin = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!admin) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    const user: any = await User.findById(userId).lean();
    console.log(user);

    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    await Promise.all([
      User.findByIdAndUpdate(userId, {
        role: body.userType,
      }),
      UserNotification.create({
        userId: user._id,
        adminId: admin._id,
        reason: "User Type Changed",
        message: "Your User Type have been to " + body.userType,
        status: "delivered",
      }),
    ]).catch((error) => {
      console.error("Failed to change user role User ", error);

      return NextResponse.json(
        { msg: "Failed to change user role User." },
        { status: 400 },
      );
    });
    return NextResponse.json(
      { msg: "User role changed successfully." },
      { status: 201 },
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params; // Access the dynamic 'id' parameter
  try {
    const body: {
      deactivateReason: string;
      deactivateOption: string;
      deactivateMessage: string;
    } = await req.json();
    console.log(body);

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    if (!userId || !Types.ObjectId.isValid(userId)) {
      console.log("no userId");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body) {
      console.log("no request body");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body.deactivateMessage) {
      console.log("no deactivation Message");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body.deactivateOption) {
      console.log("no deactivation option");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body.deactivateReason) {
      console.log("no deactivation reason");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    const admin = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!admin) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    const user = await User.findById(userId)
      .lean();
    console.log(user);

    if (!user) {
      console.log("no user found to deactivate");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }
    if (user.userStatus == "inactive") {
      console.log("user already deactivated");
      NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    const deactivateArtist = User.findByIdAndUpdate(userId, {
      userStatus: "inactive",
    });

    const deactivateEmail: DetactivateEmail = {
      artist_name: "not applicable", // "Artist Name"
      first_name: user.firstName, // "user Name"
      deactivation_type: body.deactivateOption, // Dropdown: "Temporary Suspension", etc.
      deactivation_reason: body.deactivateReason, // Dropdown: "Copyright Infringement", etc.
      additional_notes: body.deactivateMessage, // Text area content
      reference_id: "string", // Generated reference ID
      deactivation_date: "string", // Auto-generated
      data_retention_date: "string", // 30 days from now
      appeal_url: "string", // Link to appeal form
      support_url: "string", // Link to support
      download_data_url: "string", // Link to data export
    };

    //send mail here
    const deactivationHtml = userDeactivationEmail(deactivateEmail);
    await Promise.all([
      sendEmail(user.email!, "User Deactivation", deactivationHtml),
      deactivateArtist,
      EntityDeactivation.create({
        entityIdId: user._id,
        deactivationType: body.deactivateOption,
        deactivationReason: body.deactivateReason,
        additionalNotes: body.deactivateMessage,
        deactivatedBy: admin._id,
        entityStatus: "deactivated",
      }),
    ]).catch((error) => {
      console.error("Failed to Deactivate User ", error);

      return NextResponse.json(
        { msg: "Failed to Deactivate User." },
        { status: 400 },
      );
    });
    return NextResponse.json(
      { msg: "Artist Deactivated successfully." },
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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params; // Access the dynamic 'id' parameter
  try {
    const body: {
      notifyUserReason: string;
      notifyUserMessage: string;
    } = await req.json();
    console.log(body);

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    if (!userId || !Types.ObjectId.isValid(userId)) {
      console.log("no userId");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body) {
      console.log("no request body notification");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body.notifyUserMessage) {
      console.log("no notification Message");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body.notifyUserReason) {
      console.log("no notification reason");

      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    const admin = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!admin) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (admin.role != "admin" && admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    const user: any = await User.findById(userId)
      .lean();

    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    const notificationEmail: sendUserNotificationEmailType = {
      user_name: user.firstName, // "John Doe"
      user_email: user.email, // "john@example.com"
      notification_reason: body.notifyUserReason, // Dropdown selection
      additional_message: body.notifyUserMessage, // Text area content
      dashboard_url: "string", // Link to user dashboard
      support_url: "string",
    };

    //send mail here
    const notificationHtml = sendUserNotificationEmail(notificationEmail);
    await Promise.all([
      sendEmail(user.email!, body.notifyUserReason, notificationHtml),
      UserNotification.create({
        userId: user._id,
        adminId: admin._id,
        reason: body.notifyUserReason,
        message: body.notifyUserMessage,
        status: "delivered",
      }),
    ]).catch((error) => {
      console.error("Failed to send Notification ", error);

      return NextResponse.json(
        { msg: "Failed to send Notification." },
        { status: 400 },
      );
    });
    return NextResponse.json(
      { msg: "Notification sent successfully." },
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
