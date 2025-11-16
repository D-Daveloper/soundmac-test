// lib/middleware/verifyJWT.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

export interface AuthenticatedRequest {
  user: JwtPayload | null | string; // decoded token payload
  msg: string | null; // optional message for error handling
}

export const verifyJWT = async (): Promise<AuthenticatedRequest> => {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return { msg: "No token provided", user: null };
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return {
        msg: "JWT secret is not set in environment variables",
        user: null,
      };
    }

    const decoded = jwt.verify(token, secret);
    // console.log("Decoded JWT:", decoded);
    return { user: decoded, msg: null };
  } catch (error) {
    console.log("JWT verification error:", error);
    return { msg: "Invalid or expired token", user: null };
  }
};
// export const verifyJWT = async (req: Request): Promise<AuthenticatedRequest> => {
//   try {
//     // Get token from Authorization header
//     const authHeader = req.headers.get("authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return { msg: "No token provided" , user: null };
//     }

//     const token = authHeader.split(" ")[1];
//     const secret = process.env.JWT_SECRET;

//     if (!secret) {
//       return { msg:"JWT secret is not set in environment variables", user: null };
//     }

//     const decoded = jwt.verify(token, secret);
//     // console.log("Decoded JWT:", decoded);
//     return { user: decoded, msg: null };
//   } catch (error) {
//     console.log("JWT verification error:", error);
//     return { msg:"Invalid or expired token", user: null };
//   }
// };

export const verifyUser = (userData: AuthenticatedRequest) => {
  if (userData.msg) {
    return { msg: userData.msg, user: null };
  }

  let userId: string | undefined;
  if (typeof userData.user === "string") {
    userId = userData.user;
  } else if (
    userData.user &&
    typeof userData.user === "object" &&
    "userId" in userData.user
  ) {
    userId = (userData.user as { userId: string }).userId;
  } else {
    return { msg: "Invalid user data", user: null };
  }

  return { msg: null, user: userId };
};
