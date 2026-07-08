import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { handleMongooseValidationError } from "@/util/customError/error";
import { parseLabelFormData, uploadImage } from "@/util/middleware/functions";
import Label from "@/util/models/labelModel";
import mongoose from "mongoose";

const acceptedUserTypes = ["INDIE_LABEL", "MAJOR_LABEL"]

export async function POST(req: Request) {
  try {
    let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
    const formData = await req.formData();
    const { label_name,
      first_name,
      last_name,
      linkedin_profile_link,
      twitter_profile_link,
      tiktok_profile_link,
      instagram_profile_link,
      label_logo } = parseLabelFormData(formData);

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    if (
      typeof label_name != "string" ||
      !label_name
    ) {
      Uploaderror = { msg: "Label name must be a string", status: 400 };
    } else if (
      typeof first_name != "string" ||
      !first_name
    ) {
      Uploaderror = { msg: "First name must be a string", status: 400 };
    } else if (typeof last_name != "string" || !last_name) {
      Uploaderror = { msg: "Last name be a string", status: 400 };
    } else if (!label_logo || !(label_logo instanceof File)) {
      Uploaderror = { msg: "Label logo is required.", status: 400 };
    } else if (instagram_profile_link && typeof instagram_profile_link != "string") {
      Uploaderror = { msg: "instgram link must be a string", status: 400 };
    } else if (tiktok_profile_link && typeof tiktok_profile_link != "string") {
      Uploaderror = { msg: "Tik Tok link must be a string", status: 400 };
    } else if (twitter_profile_link && typeof twitter_profile_link != "string") {
      Uploaderror = { msg: "Twitter link must be a string", status: 400 };
    } else if (linkedin_profile_link && typeof linkedin_profile_link != "string") {
      Uploaderror = { msg: "LinkedIn link must be a string", status: 400 };
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    }

    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      Uploaderror = { msg: "Invalid Request", status: 401 };
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 401 };
    } else if (user.otp !== null) {
      Uploaderror = { msg: "Please login", status: 401 };
    } else if (user.label != null && user.label != "Independent Artist") {
      Uploaderror = { msg: "Only one label per account", status: 400 };
    } else if (!acceptedUserTypes.includes(user.type)) {
      Uploaderror = { msg: `${user.type.replaceAll("_", " ")} can not create label account`, status: 402 };
    } else if (user.premium !== true) {
      Uploaderror = { msg: "Please upgrade your account.", status: 402 };
    } else if (user.premium && new Date() > new Date(user.premiumExpiration!)) {
      user.premium = false;
      user.premiumExpiration = null;
      await user.save();
      Uploaderror = { msg: "Please upgrade your account.", status: 402 };
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    }

    let imageUrl: { error: string | null; coverUrl: string | null } = {
      coverUrl: null,
      error: "Failed to upload image",
    };
    try {
      const buffer = Buffer.from(await (label_logo as File).arrayBuffer());

      const imageType = (label_logo as File).type.split("/")[1]; //get the image extension

      const imageStorageLocation = `userImages/${user?.email}/label.${imageType}`;

      imageUrl = await uploadImage(
        imageType,
        buffer,
        imageStorageLocation,
      ); //send image to aws
      console.log(imageUrl);
      if (imageUrl.error || !imageUrl.coverUrl) {
        return NextResponse.json({ msg: "Error Occured when uploading label logo" }, { status: 400 })
      }
    } catch (error) {
      console.log("upload image error", error);
      return NextResponse.json({ msg: "Failed to upload image" });
    }

    const labelDetails = {
      user: user?._id,
      firstName: first_name,
      lastName: last_name,
      labelName: label_name,
      labelLogo: imageUrl.coverUrl,
      instagramProfileLink: instagram_profile_link,
      twitterProfileLink: twitter_profile_link,
      linkedinProfileLink: linkedin_profile_link,
      tiktokProfileLink: tiktok_profile_link,
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      // Pass the session to every operation
      const [newLabel] = await Label.create([labelDetails], { session });

      await User.findByIdAndUpdate(
        userJwt.user,
        { $set: { labelId: newLabel._id, label: newLabel.labelName } },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      await session.endSession();
    }

    return NextResponse.json({ msg: "Label succesfully created" }, { status: 201 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}