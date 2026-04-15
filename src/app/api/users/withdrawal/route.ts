import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { handleMongooseValidationError } from "@/util/customError/error";
import { generateOtp, numRegex } from "@/util/middleware/functions";
import PaymentForm from "@/app/dashboard/profile/Payment_Billlings";
import withDrawalModel from "@/util/models/withDrawalModel";
import sendEmail from "@/util/sendMail/sendEmail";
import salesReportLedger from "@/util/models/saleReportLedgerModel";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const user = userJwt.user ? await User.findById(userJwt.user) : null;

    if (!user) {
      return NextResponse.json(
        { success: false, msg: "User not found" },
        { status: 404 },
      );
    }

    const otp = generateOtp();
    // update user
    const updatedUser = await User.findByIdAndUpdate(
      {
        _id: user._id.toString(),
      },
      {
        otp: otp,
        otpExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes in milliseconds (1 minute = 60,000 milliseconds)
      },
      {
        new: true,
        runValidators: true,
        select: "-password -otp -otpExpires -refreshToken -refreshTokenExpires",
      },
    );
    if (process.env.NODE_ENV == "production")
      try {
        const mailRes = await sendEmail(
          `${updatedUser?.email}`,
          "OTP!",
          `
        
        <!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Withdrawal OTP</title>
	</head>
	<body>
		<div>
			Here is your otp ${otp}
			<p>Expires in 5 mins </p>

		</div>
	</body>
</html>
            `,
        );
        if (!mailRes) {
          return NextResponse.json(
            { msg: "Failed to send OTP. Please try again later." },
            { status: 500 },
          );
        }
        return NextResponse.json(
          { msg: "An otp has been sent to your email", otp: true },
          { status: 200 },
        );
      } catch (error) {
        console.log(error);
        return NextResponse.json(
          { msg: "Failed to send OTP. Please try again later." },
          { status: 500 },
        );
      }
    else {
      return NextResponse.json({ msg: "Please check your mailbox to verify." });
    }
  } catch (error: unknown) {
    console.log(error);

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

export async function POST(req: Request) {
  try {
    let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
    const formData: {
      otp: string;
      amount: string;
    } = await req.json();
    await dbConnect();

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      Uploaderror = { msg: "Invalid Request", status: 401 };
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 401 };
    // } else if (user.otp === null) {
    //   Uploaderror = { msg: "Invalid otp", status: 400 };
    // } else if (user.otpExpires === null) {
    //   Uploaderror = { msg: "Invalid otp", status: 400 };
    // } else if (user.otp != formData.otp || new Date() > user.otpExpires) {
    //   Uploaderror = { msg: "Invalid otp or Expired otp", status: 400 };
    } 
    else if (
      !formData.amount ||
      !numRegex.test(formData.amount) ||
      parseInt(formData.amount, 10) < 1000
    ) {
      Uploaderror = { msg: "Invalid amount.", status: 400 };
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    } // return any errors up to this point and delete the song
    const { availableBalance } = await getUserFinancials(user!._id?.toString());

    if (parseInt(formData.amount, 10) > availableBalance) {
      return NextResponse.json({ msg: "Insufficient available balance" }, { status: 400 });
    }
    // return;
    const session = await mongoose.startSession();
    try {

      session.startTransaction();
      const [withdrawal] = await withDrawalModel.create([{
        amount: formData.amount,
        withdrawalStatus: "pending",
        user: user?._id,
        accountNumber: user?.accountDetails.accountNumber,
        paidAt: null,
      }], { session });
      await salesReportLedger.create([{
        user: user?._id,
        type: "withdrawal",
        amountUsd: formData.amount,
        direction: "debit",
        reference: withdrawal._id,
      }], { session })
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    user!.otp = null;
    user!.otpExpires = null;
    await user!.save();

    return NextResponse.json({ msg: "success" }, { status: 201 });
  } catch (error: unknown) {
    console.log(error);
    return handleMongooseValidationError(error);
  }
}

export async function PUT(req: Request) {
  try {
    let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
    const formData: PaymentForm & {
      is_new_account: boolean;
    } = await req.json();

    await dbConnect();

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      Uploaderror = { msg: "Invalid Request", status: 401 };
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 401 };
    } else if (user.otp !== null) {
      Uploaderror = { msg: "Please login", status: 401 };
    } else if (
      formData.is_new_account &&
      (typeof formData.account_number != "string" || !formData.account_number)
    ) {
      Uploaderror = { msg: "account number must be a string", status: 400 };
    } else if (
      formData.is_new_account &&
      (typeof formData.bankName != "string" || !formData.bankName)
    ) {
      Uploaderror = { msg: "bank name must be a string", status: 400 };
    } else if (
      formData.is_new_account &&
      (typeof formData.bankCode != "string" || !formData.bankCode)
    ) {
      Uploaderror = { msg: "bank code must be a string", status: 400 };
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    } // return any errors up to this point and delete the song
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${formData.account_number}&bank_code=${formData.bankCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );
    const data = await res.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }
    const accountDetails = {
      accountHolderName: data.data.account_name,
      accountNumber: data.data.account_number,
      bankName: formData.bankName,
      bankCode: formData.bankCode,
      verified: true,
      currency: "NGN",
    };

    await User.updateOne(
      { email: user?.email },
      {
        $set: {
          accountDetails: accountDetails,
        },
      },
    );

    return NextResponse.json({ msg: data.message }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}

export async function getUserFinancials(userId: string) {
  await dbConnect();
  const [ledgerAgg, pendingWithdrawals] = await Promise.all([
    salesReportLedger.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          balance: {
            $sum: {
              $cond: [
                { $eq: ["$direction", "credit"] },
                { $toDouble: "$amountUsd" },
                { $multiply: [{ $toDouble: "$amountUsd" }, -1] }
              ]
            }
          },
          totalDocuments: { $sum: 1 }
        }
      }
    ]),
    withDrawalModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), withdrawalStatus: "pending" } },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$amount" } }
        }
      }
    ])
  ]);

  const balance = ledgerAgg[0]?.balance || 0;
  const pending = pendingWithdrawals[0]?.total || 0;
  console.log(balance,pending,balance-pending);

  return {
    ledgerBalance: balance,
    pendingWithdrawals: pending,
    availableBalance: balance - pending
  };
}