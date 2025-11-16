import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import {verifyJWT, verifyUser} from "@/util/middleware/verifyJwt";

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
      return NextResponse.json({ msg: "User Not Found" }, { status: 404 });
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
