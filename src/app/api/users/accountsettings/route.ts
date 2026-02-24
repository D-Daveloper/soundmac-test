import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { handleMongooseValidationError } from "@/util/customError/error";
import {
  parseVerificationFormData,
  uploadImage,
  validateVerificationForm,
} from "@/util/middleware/functions";
import sharp from "sharp";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const userData = await verifyJWT();

    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user
      ? await User.findById(userJwt.user, {
          password: 0,
          refreshToken: 0,
          refreshTokenExpires: 0,
          otp: 0,
          otpExpires: 0,
        })
      : null;

    if (!user) {
      return NextResponse.json({ msg: "User Not Found" }, { status: 401 });
    }

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

export async function PUT(req: Request) {
  try {
    let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
    const form = await req.json();
    console.log({ ...form });

    await dbConnect();

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 401 });
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 401 };
    } else if (user.otp !== null) {
      Uploaderror = { msg: "Please login", status: 401 };
    } else if (typeof form.currentPassword != "string" && !form.currentPassword) {
      Uploaderror = { msg: "current password must be a string", status: 400 };
    } else if (typeof form.newPassword != "string" && !form.newPassword) {
      Uploaderror = { msg: "new password must be a string", status: 400 };
    } else if (typeof form.confirmNewPassword != "string" && !form.confirmNewPassword) {
      Uploaderror = { msg: "confirm new password must be a string", status: 400 };
    } else if (form.confirmNewPassword !== form.newPassword) {
      Uploaderror = { msg: "confirm new password must match new password", status: 400 };
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    }

    const isOldPasswordMatch = await user.comparePassword(form.newPassword.trim());

    if (isOldPasswordMatch) {
      return NextResponse.json({ msg: "New Password cannot be the same as the old password" }, { status: 400 });
    }
    
    const isMatch = await user.comparePassword(form.currentPassword.trim());

    if (!isMatch) {
      return NextResponse.json({ msg: "Invalid credentials" }, { status: 400 });
    }
    user.password = form.newPassword.trim();
    await user.save();
    return NextResponse.json({ msg: "Password Changed Successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}

export async function POST(req: Request){
  try {
    let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
    const form = await req.json();
    console.log({ ...form });

    await dbConnect();

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 401 });
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 401 };
    } else if (user.otp !== null) {
      Uploaderror = { msg: "Please login", status: 401 };
    } else if (typeof form.reason != "string" && !form.reason) {
      Uploaderror = { msg: "please select a reason.", status: 400 };
    } else if (typeof form.description != "string" && !form.description && form.reason === "Other (please specify)") {
      Uploaderror = { msg: "description is required.", status: 400 };
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    }

    const isOldPasswordMatch = await user.comparePassword(form.newPassword.trim());

    if (isOldPasswordMatch) {
      return NextResponse.json({ msg: "New Password cannot be the same as the old password" }, { status: 400 });
    }

    const isMatch = await user.comparePassword(form.currentPassword.trim());

    if (!isMatch) {
      return NextResponse.json({ msg: "Invalid credentials" }, { status: 400 });
    }
    user.password = form.newPassword.trim();
    await user.save();
    return NextResponse.json({ msg: "Password Changed Successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}
