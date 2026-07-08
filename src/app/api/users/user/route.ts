import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { handleMongooseValidationError } from "@/util/customError/error";
import { uploadImage } from "@/util/middleware/functions";
import sharp from "sharp";
import PaymentForm from "@/app/dashboard/profile/Payment_Billlings";

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
    const formData = await req.formData();
    console.log({ ...formData });
    const profile_pic = formData.get("profile_pic");
    const firstName = formData.get("first_name");
    const lastName = formData.get("last_name");
    const email = formData.get("email");
    const country = formData.get("country");
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
    } else if (typeof firstName != "string" && !firstName) {
      Uploaderror = { msg: "first must be a string", status: 400 };
    } else if (typeof lastName != "string" && !lastName) {
      Uploaderror = { msg: "last name must be a string", status: 400 };
    } else if (typeof country != "string" && !country) {
      Uploaderror = { msg: "country must be a string", status: 400 };
    } else if (typeof email != "string" && !email) {
      Uploaderror = { msg: "Email must be a valid email.", status: 400 };
    } else if (profile_pic && !(profile_pic instanceof File)) {
      Uploaderror = { msg: "Profile pic must be a file", status: 400 };
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    } // return any errors up to this point and delete the song
    let imageUrl: { error: string | null; coverUrl: string | null } = {
      coverUrl: null,
      error: "Failed to upload image",
    };
    if (profile_pic) {
      try {
        const buffer = Buffer.from(await (profile_pic as File).arrayBuffer());
        // ---- Resize to distributor standard ----
        const resized = await sharp(buffer)
          .resize(3000, 3000, { fit: "cover" })
          .jpeg({ quality: 90 })
          .toBuffer(); //resize the image for dpm
        console.log("buffer", resized);

        const imageType = (profile_pic as File).type.split("/")[1]; //get the image extension

        const imageStorageLocation = `userImages/${user?.email}/profile.${imageType}`;

        imageUrl = await uploadImage(
          imageType,
          resized as Buffer<ArrayBuffer>,
          imageStorageLocation,
        ); //send image to aws
        console.log(imageUrl);
      } catch (error) {
        console.log("upload image error", error);
        return NextResponse.json({ msg: "Failed to upload image" });
      }
    }

    user!.firstName = firstName ? firstName.toString() : user!.firstName;
    user!.lastName = lastName ? lastName.toString() : user!.lastName;
    user!.country = country ? country.toString() : user!.country;
    user!.email = email ? email?.toString() : user!.email;
    user!.profilePic = imageUrl.coverUrl;
    await user!.save();
    return NextResponse.json({ msg: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}

export async function POST(req: Request) {
  try {
    let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
    const formData: PaymentForm = await req.json();

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
      typeof formData.account_name != "string" &&
      formData.account_name
    ) {
      Uploaderror = { msg: "account name must be a string", status: 400 };
    } else if (
      typeof formData.account_number != "string" ||
      !formData.account_number
    ) {
      Uploaderror = { msg: "account number must be a string", status: 400 };
    } else if (typeof formData.country != "string" || !formData.country) {
      Uploaderror = { msg: "country must be a string", status: 400 };
    } else if (typeof formData.bankName != "string" || !formData.bankName) {
      Uploaderror = { msg: "bank name must be a string", status: 400 };
    } else if (typeof formData.bankCode != "string" || !formData.bankCode) {
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
          country: formData.country,
          accountDetails: accountDetails,
        },
      },
    );
    
    return NextResponse.json({ msg: data.message,accountDetails }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}
