import { NextResponse } from "next/server";
import  dbConnect  from "../../../../lib/db";
import User from "../../../../lib/models/userModel";

export async function GET(req: Request,context: { params: Promise<{ id: string }> }) {
  try {    
    await dbConnect();
    const {id} = await context.params;
    if (!id) {
      return NextResponse.json({ msg: "No ID provided" }, { status: 400 });
    }
    console.log("Verifying user with ID:", id);
    
    const user = await User.findById(id);
    if (!user) {
        return NextResponse.json({ msg: "User not found" }, { status: 404 });
    }
    user.confirmed = true;
    await user.save();

    return NextResponse.json({ msg: "Please log in." });
  }catch (error: unknown) {
    if (error instanceof Error){
      return NextResponse.json({ msg: error.message }, { status: 500 });
    }else{
      return NextResponse.json({ msg: "An unknown error occurred" }, { status: 500 });
    }
  }
}
