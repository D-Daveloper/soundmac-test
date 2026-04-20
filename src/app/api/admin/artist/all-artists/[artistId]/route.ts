import {
  DetactivateEmail,
  sendUserNotificationEmailType,
} from "@/app/type";
import dbConnect from "@/util/db";
import {
  artistDeactivationEmail,
  sendUserNotificationEmail,
} from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import sendEmail from "@/util/sendMail/sendEmail";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import SongModel from "@/util/models/songModel";
import Artist from "@/util/models/artistModel";
import AlbumModel from "@/util/models/AlbumModel";
import UserNotification from "@/util/models/userNotification";
import EntityDeactivation from "@/util/models/deactivateEntity";
import salesReport from "@/util/models/salesReportModel";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ artistId: string }> },
) {
  try {
    const { artistId } = await params;

    // Validate input before hitting auth/DB
    if (!artistId || !Types.ObjectId.isValid(artistId)) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      parseInt(searchParams.get("limit") || "50", 10),
    );
    const releaseTitle = searchParams.get("releaseTitle");
    const releaseStatusFilter = searchParams.get("releaseStatusFilter");

    // Build the shared match query
    const matchQuery: Record<string, any> = {
      artist: new Types.ObjectId(artistId),
    };
    if (releaseTitle?.trim()) {
      matchQuery.releaseTitle = { $regex: `^${releaseTitle}`, $options: "i" };
    }
    if (releaseStatusFilter?.trim() && releaseStatusFilter != "all") {
      matchQuery.releaseStatus = releaseStatusFilter; // now actually applied
    }
    console.log(matchQuery);

    const projection = {
      releaseTitle: 1,
      releaseStatus: 1,
      artistName: 1,
      releaseDate: 1,
      upc: 1,
      isrc: 1,
      catalogNumber: 1,
    };

    // Run combined releases aggregation and artist fetch in parallel
    const [aggregationResult, artist] = await Promise.all([
      SongModel.aggregate([
        { $match: matchQuery },
        { $addFields: { type: "single" } },
        { $project: projection },

        {
          // Merge albums into the same pipeline as one dataset
          $unionWith: {
            coll: AlbumModel.collection.name,
            pipeline: [
              { $match: matchQuery },
              { $addFields: { type: "album" } },
              { $project: projection },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        {
          // Single pass: get paginated data AND total count together
          $facet: {
            data: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              { $project: projection },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]),
      Artist.findById(artistId).lean(),

    ]);

    let artist_earnings =[];
    if (artist){

       artist_earnings =             
         //total net amount
        await salesReport.aggregate([
          { $match: { matchStatus: "matched", artist: artist._id} },
          {
            $group: {
              _id: null,
              totalNetAmount: { $sum: { $toDouble: "$netAmountUsd" } },
              totalDocuments: { $sum: 1 }
            }
          }
        ])
    }
    console.log(artist_earnings);

    const totalCount = aggregationResult[0]?.totalCount[0]?.count ?? 0;

    return NextResponse.json({
      data: aggregationResult[0]?.data ?? [],
      artist,
      page,
      limit,
      totalCount,
      totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
      totalRevenue: artist_earnings.length > 0 ? artist_earnings[0].totalNetAmount : 0,
      msg: "Artist data fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching artist data:", error);
    return NextResponse.json(
      { msg: "Failed to fetch artist data." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ artistId: string }> },
) {
  const { artistId } = await params; // Access the dynamic 'id' parameter
  try {
    const body: {
      appleId: string;
      spotifyId: string;
    } = await req.json();
    console.log(body);

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    if (!artistId || !Types.ObjectId.isValid(artistId)) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (typeof body.appleId != "string" && body.appleId) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (typeof body.spotifyId != "string" && body.spotifyId) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }
    
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    const artist = await Artist.findById(artistId).lean();

    if (!artist) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else {
      await Artist.findByIdAndUpdate(artistId, {
        appleId: body.appleId,
        spotifyId: body.spotifyId,
      });
      return NextResponse.json(
        { msg: "Artist details updated successfully" },
        { status: 201 },
      );
    }
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
  { params }: { params: Promise<{ artistId: string }> },
) {
  const { artistId } = await params; // Access the dynamic 'id' parameter
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

    if (!artistId || !Types.ObjectId.isValid(artistId)) {
      console.log("no artistId");

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

    const admin = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!admin) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (admin.role != "admin" && admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    const artist: any = await Artist.findById(artistId)
      .populate("user", "email")
      .lean();
    console.log(artist);

    if (!artist) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }
    if (artist.artistStatus == "inactive") {
      console.log("artist already deactivated");
      NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    const deactivateArtist = Artist.findByIdAndUpdate(artistId, {
      artistStatus: "inactive",
    });
    const deactivateEmail: DetactivateEmail = {
      artist_name: artist.artistName, // "Artist Name"
      first_name: "",
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
    const deactivationHtml = artistDeactivationEmail(deactivateEmail);
    await Promise.all([
      sendEmail(artist.user.email!, "Artist Deactivation", deactivationHtml),
      deactivateArtist,
      EntityDeactivation.create({
        entityType: "artist",
        entityId: artist._id,
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
  { params }: { params: Promise<{ artistId: string }> },
) {
  const { artistId } = await params; // Access the dynamic 'id' parameter
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

    if (!artistId || !Types.ObjectId.isValid(artistId)) {
      console.log("no artistId");

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

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    const artist: any = await Artist.findById(artistId)
      .populate("user", "firstName email")
      .lean();
    console.log(artist);

    if (!artist) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    const notificationEmail: sendUserNotificationEmailType = {
      user_name: artist.user.firstName!, // "John Doe"
      user_email: artist.user.email!, // "john@example.com"
      notification_reason: body.notifyUserReason, // Dropdown selection
      additional_message: body.notifyUserMessage, // Text area content
      dashboard_url: "string", // Link to user dashboard
      support_url: "string",
    };

    //send mail here
    const notificationHtml = sendUserNotificationEmail(notificationEmail);
    await Promise.all([
      sendEmail(artist.user.email!, body.notifyUserReason, notificationHtml),
      UserNotification.create({
        userId: artist.user._id!,
        adminId: user._id,
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
