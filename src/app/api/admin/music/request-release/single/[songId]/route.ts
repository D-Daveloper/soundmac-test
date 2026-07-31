import { rejectEmailProps, songFromApi } from "@/app/type";
import dbConnect from "@/util/db";
import {
  releaseApprovalEmail,
  releaseRejectionEmail,
  replaceTemplatePlaceholders,
} from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import SongModel from "@/util/models/songModel";
import { inngest } from "@/util/lib/inngest/inngest";
import UserNotification from "@/util/models/userNotification";
import { logAdminActivity } from "@/util/lib/adminActivityLog/adminActivityLogHelper";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ songId: string }> },
) {
  const { songId } = await params; // Access the dynamic 'id' parameter
  try {
    const body: {
      requestType: "approved" | "rejected";
      message?: string;
      songId: string;
    } = await req.json();
    console.log(body);

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

    // const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    // if (!user) {
    //   return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    // } else if (user.role != "admin" && user.role != "super_admin") {
    //   return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    // }

    if (!body) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (
      body.requestType != "approved" &&
      body.requestType != "rejected"
    ) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (body.requestType == "rejected" && !body.message) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!songId || !Types.ObjectId.isValid(songId)) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }
    const release: songFromApi & { user: { email: string; _id: string } } =
      await SongModel.findById(songId).populate("user", "email label").lean();

    if (!release) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (release.releaseStatus != "pending") {
      return NextResponse.json(
        { msg: "Only pending songs can be " + body.requestType },
        { status: 400 },
      );
    }

    const userEmail = release.user.email;

    if (body.requestType == "approved") {
      // Execute the model method passing the session
      const result = await SongModel.approveAndCreateMetadata(
        songId,
        release.user.label,
      );
      if (result.error) {
        return NextResponse.json({ msg: result.msg }, { status: 400 });
      } else {
        const approvalEmailData = {
          artistName: release.artistName,
          releaseTitle: release.releaseTitle,
          releaseDate: new Date(release.releaseDate).toDateString(),
          releaseUrl:
            process.env.FRONTEND_URL +
            "/dashboard/music/manageRelease?type=single",
          supportEmail: "",
          company_name: "Soundmac",
          year: new Date().getFullYear().toString(),
          company_address: "",
          website_url: process.env.FRONTEND_URL!,
          help_center_url: "",
          terms_url: "",
          unsubscribe_url: "",
        };
        const emailTitle = "Release Approval";

        const approvalEmailhtml = replaceTemplatePlaceholders(
          releaseApprovalEmail(),
          approvalEmailData,
        );
        await inngest.send({
          name: "send-email",
          data: {
            html: approvalEmailhtml,
            emailTo: userEmail,
            title: emailTitle,
          },
        });
        await inngest.send({
          name: "release/deliver",
          data: {
            upc: release.upc,
            listDspId: release.dsp.map((item) => item.value),
            releaseId: release._id,
            isSingle: true,
          },
        });

        await UserNotification.create({
          userId: release.user._id,
          adminId: admin._id,
          reason: "Release Approved",
          message: `Your release "${release.releaseTitle}" has been approved and is going live! Check your email for full details.`,
          status: "delivered",
        });

        await logAdminActivity({
          adminId: admin._id.toString(),
          adminName: `${admin.firstName} ${admin.lastName}`,
          action: "release.approved",
          entityType: "song",
          entityId: songId,
          entityLabel: release.releaseTitle,
        });

        return NextResponse.json({ msg: result.msg }, { status: 201 });
      }
    } else if (body.requestType == "rejected") {
      const updateRelease = await SongModel.findByIdAndUpdate(
        songId,
        { releaseStatus: body.requestType },
        { runValidators: true },
      );
      const rejectEmailData: rejectEmailProps = {
        artistName: release.artistName,
        releaseTitle: release.releaseTitle,
        rejectionReason: body.message,
        dashboardUrl: "release",
        supportEmail: "release",
      };

      //send mail here
      const rejectionEmail = releaseRejectionEmail(rejectEmailData);
      const emailTitle = "Release Rejection";
      //  background job
      await inngest.send({
        name: "send-email",
        data: {
          html: rejectionEmail,
          emailTo: userEmail,
          title: emailTitle,
        },
      });

      await UserNotification.create({
        userId: release.user._id,
        adminId: admin._id,
        reason: "Release Rejected",
        message: `Your release "${release.releaseTitle}" was not approved. Please check your email for the reason and next steps.`,
        status: "delivered",
      });

      await logAdminActivity({
        adminId: admin._id.toString(),
        adminName: `${admin.firstName} ${admin.lastName}`,
        action: "release.rejected",
        entityType: "song",
        entityId: songId,
        entityLabel: release.releaseTitle,
      });
    }

    return NextResponse.json(
      { msg: "Release" + " " + body.requestType + "." },
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ songId: string }> },
) {
  const { songId } = await params; // Access the dynamic 'id' parameter
  try {
    // Check admin authorization (adjust to your auth system)
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

    if (!songId || !Types.ObjectId.isValid(songId)) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }
    const projection = {
      releaseTitle: 1,
      releaseAudio: 1,
      releaseStatus: 1,
      releaseImage: 1,
      artistName: 1,
      genre: 1,
      releaseDate: 1,
      upc: 1,
      isrc: 1,
      featuredArtist: 1,
      songWriter: 1,
      producer: 1,
      catalogNumber: 1,
      explicitContent: 1,
      lyrics: 1,
      copyRightYear: 1,
      copyRightHolder: 1,
      license: 1,
    };
    // Get audio record from database
    const release = await SongModel.findById(songId, projection)
      .populate("user", "email")
      .populate("artist", "spotifyId appleId -_id")
      .lean();

    if (!release) {
      return NextResponse.json({ msg: "Audio not found" }, { status: 400 });
    }
    // console.log(release);

    return NextResponse.json({
      release,
      msg: "Link generated Successfully.",
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 },
    );
  }
}
