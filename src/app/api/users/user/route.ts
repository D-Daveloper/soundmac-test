import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import {verifyJWT, verifyUser} from "@/util/middleware/verifyJwt";
import { handleMongooseValidationError } from "@/util/customError/error";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const userData = await verifyJWT();
    
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }


    const user = userJwt.user ? await User.findById(userJwt.user,{password:0,subscriptionCode:0,customerCode:0,authorizationCode:0}) : null;

    if (!user) {
      return NextResponse.json({ msg: "User Not Found" }, { status: 401 });
    };
    
    return NextResponse.json({ msg: "Successful" ,user});
  } catch (error: unknown) {
    if (error instanceof Error){
      return NextResponse.json({ msg: error.message }, { status: 500 });
    }else{
      return NextResponse.json({ msg: "An unknown error occurred" }, { status: 500 });
    }
  }
}

export async function POST(req: Request) {
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
    } else if(typeof firstName != "string" && !firstName){
      Uploaderror = { msg: "first must be a string", status: 400 };
    } else if(typeof lastName != "string" && !lastName){
      Uploaderror = { msg: "last name must be a string", status: 400 };
    } else if(typeof country != "string" && !country){
      Uploaderror = { msg: "country must be a string", status: 400 };      
    } else if(typeof email != "string" && !email){
      Uploaderror = { msg: "Email must be a valid email.", status: 400 };      
    } else if(profile_pic && !(profile_pic instanceof File)){
      Uploaderror = { msg: "Profile pic must be a file", status: 400 };
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    } // return any errors up to this point and delete the song
    user!.firstName = firstName ? firstName.toString() : ""
    user!.lastName = lastName ? lastName.toString() : ""
    user!.country = country ? country.toString() : ""
    user!.email = email ? email?.toString() : ""
    await user!.save();
    return NextResponse.json({ msg: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}
