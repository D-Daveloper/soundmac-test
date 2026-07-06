import Referral from "@/util/models/ReferralModel";
import User from "@/util/models/userModel";
import { authenticate } from "@/util/middleware/authMiddleware";
import { NextResponse } from "next/server";
import dbConnect from "@/util/db";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const userJwt = await authenticate(req);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const user = await User.findOne({ _id: userJwt.user }).select(
      "firstName lastName referralCode",
    );
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          msg: "User not found",
        },
        { status: 404 },
      );
    }

    const referrals = await Referral.find({ referrer: user._id })
      .populate("referred", "firstName lastName email")
      .sort({ createdAt: -1 });
    const totalReferrals = referrals.length;
    const pendingReferrals = referrals.filter(
      (referral) => referral.status === "pending",
    ).length;
    const completedReferrals = referrals.filter(
      (referral) => referral.status === "completed",
    ).length;
    const totalCommission = referrals.reduce(
      (total, referral) => total + (referral.commissionAmount || 0),
      0,
    );
    return NextResponse.json({
      success: true,
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,
      stats: {
        totalReferrals,
        pendingReferrals,
        completedReferrals,
        totalCommission,
      },

      referrals,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        msg: "Failed to load referral details.",
      },
      { status: 500 },
    );
  }
}
