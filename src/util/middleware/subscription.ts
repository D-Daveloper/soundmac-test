import { IUser } from "../models/userModel";

export function requireActiveSubscription(
  user: IUser,
): { msg: string; status: number } | null {
  if (user.subscriptionDetails?.subscriptionStatus === "EXPIRED") {
    return { msg: "Please upgrade your account.", status: 402 };
  }
  return null; // ACTIVE, GRACE_PERIOD, and CANCELLED (pre-expiry) all pass — only EXPIRED blocks
}

