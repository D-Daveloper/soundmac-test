import AdminActivityLogModel from "@/util/models/adminActivityModel";

export const ADMIN_ACTIONS = [
  "release.approved",
  "release.rejected",
  "user.verification_approved",
  "user.verification_rejected",
  //   "user.banned",
  //   "user.unbanned",
  //   "user.suspended",
  "withdrawal.approved",
  "withdrawal.rejected",
  "artist.verified",
  "artist.rejected",
  "artist.deactivated",
  "promotion.rejected",
  "promotion.approved",
  "promotion.completed",
  "chart.approved",
  "exchangeRate.saved",
  "apikey.created",
  "apiKey.revoked",
  "admin.logged_out",
  "admin.logged_in",
  "label.deactivated",
  "salesReport.uploaded",
  "support.resolved",
] as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[number];

export async function logAdminActivity({
  adminId,
  adminName,
  action,
  entityType,
  entityId,
  entityLabel,
  metadata,
}: {
  adminId: string;
  adminName: string;
  action: AdminAction;
  entityType: string;
  entityId: string;
  entityLabel?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await AdminActivityLogModel.create({
      admin: adminId,
      adminName,
      action,
      entityType,
      entityId,
      entityLabel,
      metadata,
    });
  } catch (error) {
    console.error("Failed to write admin activity log:", error);
  }
}
