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
import Artist from "@/util/models/artistModel";
import UserNotification from "@/util/models/userNotification";
import EntityDeactivation from "@/util/models/deactivateEntity";
import Label from "@/util/models/labelModel";

export async function GET(req: Request, { params }: { params: Promise<{ labelId: string }> },
) {
  try {
    const { labelId } = await params;

    // Validate input before hitting auth/DB
    if (!labelId || !Types.ObjectId.isValid(labelId)) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }

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

    const label = await Label.findById(labelId)
      .populate("user", "email firstName lastName")
      .lean();

    let labelWithArtists: any = { ...label };
    if (label) {
      const artists = await Artist.find({ user: label.user }).lean();
      labelWithArtists = { ...label, artists }

    }
    // console.log(labelWithArtists);

    return NextResponse.json(
      {
        data: labelWithArtists,
        msg: label ? "Successful" : "No labels found",
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ labelId: string }> },
) {
  const { labelId } = await params; // Access the dynamic 'id' parameter
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
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    if (!labelId || !Types.ObjectId.isValid(labelId)) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (typeof body.appleId != "string" && body.appleId) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (typeof body.spotifyId != "string" && body.spotifyId) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }
    const artist = await Artist.findById(labelId).lean();

    if (!artist) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else {
      await Artist.findByIdAndUpdate(labelId, {
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
  { params }: { params: Promise<{ labelId: string }> },
) {
  const { labelId } = await params; // Access the dynamic 'id' parameter
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

    if (!labelId || !Types.ObjectId.isValid(labelId)) {
      console.log("no labelId");

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

    const label: any = await Label.findById(labelId)
      .populate("user", "email")
      .lean();
    // console.log(label);

    if (!label) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }
    if (label.labelStatus == "inactive") {
      console.log("label already deactivated");
      NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    const deactivateArtist = Label.findByIdAndUpdate(labelId, {
      artistStatus: "inactive",
    });
    const deactivateEmail: DetactivateEmail = {
      artist_name: label.firstName, // "Artist Name"
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
      sendEmail(label.user.email!, "Label Deactivation", deactivationHtml),
      deactivateArtist,
      EntityDeactivation.create({
        entityType:"label",
        entityId: label._id,
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
  { params }: { params: Promise<{ labelId: string }> },
) {
  const { labelId } = await params; // Access the dynamic 'id' parameter
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

    if (!labelId || !Types.ObjectId.isValid(labelId)) {
      console.log("no labelId");

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

    const label: any = await Label.findById(labelId)
      .populate("user", "email")
      .lean();
    console.log(label);

    if (!label) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    const notificationEmail: sendUserNotificationEmailType = {
      user_name: label.firstName, // "John Doe"
      user_email: label.user.email!, // "john@example.com"
      notification_reason: body.notifyUserReason, // Dropdown selection
      additional_message: body.notifyUserMessage, // Text area content
      dashboard_url: "string", // Link to user dashboard
      support_url: "string",
    };

    //send mail here
    const notificationHtml = sendUserNotificationEmail(notificationEmail);
    await Promise.all([
      sendEmail(label.user.email!, body.notifyUserReason, notificationHtml),
      UserNotification.create({
        userId: label.user._id!,
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
