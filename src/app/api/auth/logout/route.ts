import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import { logAdminActivity } from "@/util/lib/adminActivityLog/adminActivityLogHelper";

export async function POST() {
   try {
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (!userJwt.msg && userJwt.user) {
      await dbConnect();
      const user = await User.findById(userJwt.user).lean();
      if (user && (user.role === "admin" || user.role === "super_admin")) {
        await logAdminActivity({
          adminId: user._id.toString(),
          adminName: `${user.firstName} ${user.lastName}`,
          action: "admin.logged_out",
          entityType: "session",
          entityId: user._id.toString(),
          entityLabel: `${user.firstName} ${user.lastName} logged out`,
        });
      }
    }
  } catch (error) {
    console.error("Failed to log admin logout activity:", error);
  }

  const cookieStore = await cookies();
  
  // Method 1: Explicitly delete the cookie
  cookieStore.delete('accessToken'); 
  cookieStore.delete('refreshToken'); 

  // Method 2 (Alternative): Overwrite with an expired date to ensure deletion
//   cookieStore.set('token', '', { expires: new Date(0), path: '/' });

  return NextResponse.json({ message: 'Logged out successfully' });
}
