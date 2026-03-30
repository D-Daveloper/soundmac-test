import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { handleMongooseValidationError } from "@/util/customError/error";
import { uploadImage } from "@/util/middleware/functions";
import supportRequestsModel from "@/util/models/supportRequestsModel";

export async function POST(req: Request) {
  try {
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const formData = await req.formData();

    // Get the file
    const file = formData.get("screenshot") as File | null;
    const issueCategory = formData.get("category") as string;
    const issueDetail = formData.get("description") as string;
    let selectedImage: {
      error: string | null;
      coverUrl: string | null;
    } = {
      error: null,
      coverUrl: null,
    };
    if (!issueCategory) {
      return NextResponse.json(
        { msg: "Please select an issue category." },
        { status: 400 },
      );
    } else if (!issueDetail) {
      return NextResponse.json(
        {
          msg: "Provide more detail about the issue.",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid User." }, { status: 401 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address." },
        { status: 400 },
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 401 });
    } else if (user.premium !== true) {
      return NextResponse.json(
        { msg: "Please upgrade your account." },
        { status: 402 },
      );
    }

    if (file && file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { msg: "File size should be less than 5MB." },
        { status: 400 },
      );
    } else if (file && !["image/jpeg", "image/png"].includes(file.type)) {
      return NextResponse.json(
        { msg: "Only JPEG and PNG images are allowed." },
        { status: 400 },
      );
    } else if (file) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const imageType = file.type.split("/")[1];
        const date = new Date().toISOString().split("T")[0]; // 2026-03-30
        const uniqueId = Math.random().toString(36).substring(2, 8); // Short random string
        const imageStorageLocation = `supportImages/user_${user._id}/${date}_${uniqueId}.${imageType}`;
        selectedImage = await uploadImage(
          imageType,
          buffer,
          imageStorageLocation,
        );
        if (selectedImage.coverUrl === null) {
          return NextResponse.json(
            {
              msg: selectedImage.error,
            },
            { status: 500 },
          );
        }
      } catch (error) {
        console.log("error uploading user support screen shot " + error);
        return NextResponse.json(
          {
            msg: "Error uploading image. Please try again later.",
          },
          { status: 500 },
        );
      }
    }
    await supportRequestsModel.create({
      issueCategory,
      issueDetail,
      issueStatus: "pending",
      screenshot: selectedImage?.coverUrl || null,
      user: user._id,
    });
    return NextResponse.json(
      { msg: "Support request submitted successfully" },
      { status: 201 },
    );
  } catch (error: unknown) {
    return handleMongooseValidationError(error);
  }
}
