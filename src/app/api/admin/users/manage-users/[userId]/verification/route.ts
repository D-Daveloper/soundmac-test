import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { Types } from "mongoose";
import { rejectEmailProps } from "@/app/type";
import { releaseRejectionEmail } from "@/util/middleware/functions";
import sendEmail from "@/util/sendMail/sendEmail";

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

    const user = userJwt.user
      ? await User.findById(userJwt.user, {verificationDetails:1,firstName:1,lastName:1,
        })
      : null;

    return NextResponse.json({ msg: "Successful", user });
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


export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params; // Access the dynamic 'id' parameter
  try {
    const body: {
      requestType: "approved" | "rejected";
      rejecteUserVerificationMessage?: string;
      rejecteUserVerificationReason?: string;
    } = await req.json();
    console.log(body);
    
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    if (!body) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (
      body.requestType != "approved" &&
      body.requestType != "rejected"
    ) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (body.requestType == "rejected" && !body.rejecteUserVerificationMessage) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (body.requestType == "rejected" && !body.rejecteUserVerificationReason) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ msg: "Invalid Request." },{status:400});
    }

    await dbConnect();

    const admin = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!admin) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (admin.role != "admin" && admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (user.verificationDetails && user.verificationDetails?.verified != "pending") {
      return NextResponse.json(
        { msg: "Only pending Verification can be " + body.requestType },
        { status: 400 },
      );
    }

    if (body.requestType == "approved") {
      await User.findByIdAndUpdate(
        userId,
        { "verificationDetails.verified": body.requestType },
        { runValidators: true },
      );
    } else if (body.requestType == "rejected") {
      const userVerification = User.findByIdAndUpdate(
        userId,
        { "verificationDetails.verified": body.requestType },
        { runValidators: true },
      );
      const rejectEmailData: rejectEmailProps = {
        artistName: user.firstName,
        releaseTitle: user.lastName,
        rejectionReason: body.rejecteUserVerificationMessage,
        dashboardUrl: "user",
        supportEmail: "user",
      };

      //send mail here
      const rejectionEmail = releaseRejectionEmail(rejectEmailData);
      await Promise.all([
        sendEmail(user.email, "Verification Rejected", rejectionEmail),
        userVerification,
      ]).catch((error) => {
        console.error("failed to reject user verification ", error);

        return NextResponse.json(
          { msg: "Failed to reject user verification." },
          { status: 400 },
        );
      });
    }

    return NextResponse.json(
      { msg: "user verification has been" + " " + body.requestType + "." },
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
