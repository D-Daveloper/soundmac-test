import {WithdrawalEmailBody, withdrawals } from "@/app/type";
import dbConnect from "@/util/db";
import {
  replaceTemplatePlaceholders,
  withdrawalApprovalEmail,
  withdrawalRejectionEmail,
} from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import sendEmail from "@/util/sendMail/sendEmail";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import withDrawalModel from "@/util/models/withDrawalModel";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ withdrawalId: string }> },
) {
  const { withdrawalId } = await params; // Access the dynamic 'id' parameter
  try {
    const body: {
      requestType: "approved" | "rejected";
      message?: string;
      reason?: string;
      withdrawalId: string;
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
    } else if (body.requestType == "rejected" && !body.message) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (body.requestType == "rejected" && !body.reason) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!withdrawalId || !Types.ObjectId.isValid(withdrawalId)) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }

    await dbConnect();

    const admin = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!admin) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (admin.role != "admin" && admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    const withdrawal = await withDrawalModel
      .findById(withdrawalId)
      .populate("user", "email firstName country accountDetails")
      .lean<withdrawals>();

    if (!withdrawal) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (withdrawal.withdrawalStatus != "pending") {
      return NextResponse.json(
        { msg: "Only pending withdrawals can be " + body.requestType },
        { status: 400 },
      );
    }

    let withdrawalEmailhtml: string = "";
    let withdrawalUpdate;

    if (body.requestType == "approved") {
      withdrawalUpdate = withDrawalModel.findByIdAndUpdate(
        withdrawalId,
        { withdrawalStatus: body.requestType },
        { runValidators: true },
      );

      const withdrawalEmailData: WithdrawalEmailBody = {
        user_name: withdrawal.user.firstName,
        currency: "NGN",
        amount: withdrawal.amount.toString(),
        transaction_id: withdrawal._id,
        request_date: withdrawal.createdAt.toDateString(),
        update_date: new Date().toDateString(),
        account_name: withdrawal.user.accountDetails.accountHolderName!,
        account_number: withdrawal.user.accountDetails.accountNumber!,
        processing_time: "24 hours",
        bank_name: withdrawal.user.accountDetails.bankName!,
      };

      withdrawalEmailhtml = replaceTemplatePlaceholders(
        withdrawalApprovalEmail(),
        withdrawalEmailData,
      );
    } else if (body.requestType == "rejected") {
      withdrawalUpdate = withDrawalModel.findByIdAndUpdate(
        withdrawalId,
        { withdrawalStatus: body.requestType },
        { runValidators: true },
      );

      const withdrawalEmailData: WithdrawalEmailBody = {
        user_name: withdrawal.user.firstName,
        currency: "NGN",
        amount: withdrawal.amount.toString(),
        transaction_id: withdrawal._id,
        request_date: withdrawal.createdAt.toDateString(),
        update_date: new Date().toDateString(),
        account_name: withdrawal.user.accountDetails.accountHolderName!,
        account_number: withdrawal.user.accountDetails.accountNumber!,
        processing_time: "24 hours",
        bank_name: withdrawal.user.accountDetails.bankName!,
        rejection_reason: body.reason,
        admin_message: body.message,
      };

      //send mail here
      withdrawalEmailhtml = replaceTemplatePlaceholders(
        withdrawalRejectionEmail(),
        withdrawalEmailData,
      );
    }

    await Promise.all([
      sendEmail(
        withdrawal.user.email,
        "Withdrawal " + body.requestType,
        withdrawalEmailhtml,
      ),
      withdrawalUpdate,
    ]).catch((error) => {
      console.error("failed to reject withdrawal request", error);

      return NextResponse.json(
        { msg: "Failed to reject withdrawal request." },
        { status: 400 },
      );
    });

    return NextResponse.json(
      { msg: "Withdrawal request has been" + " " + body.requestType + "." },
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
  { params }: { params: Promise<{ withdrawalId: string }> },
) {
  const { withdrawalId } = await params; // Access the dynamic 'id' parameter
  try {
    // Check admin authorization (adjust to your auth system)
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    
    if (!withdrawalId || !Types.ObjectId.isValid(withdrawalId)) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
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



    const withdrawal = await withDrawalModel
      .findById(withdrawalId)
      .populate("user", "firstName lastName country accountDetails email -_id")
      .lean();

    if (!withdrawal) {
      return NextResponse.json(
        { msg: "withdrawal not found" },
        { status: 400 },
      );
    }
    // console.log(withdrawal);

    return NextResponse.json({
      withdrawal,
      msg: "Successful.",
    });
  } catch (error) {
    console.error("Error getting withdrawals", error);
    return NextResponse.json(
      { error: "Failed to get withdrawal." },
      { status: 500 },
    );
  }
}
