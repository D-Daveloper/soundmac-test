"use client";

import React, { useState } from "react";
import { useGetReferralDetails } from "@/util/customHooks/useQueries";
import { handleCopy } from "@/util/middleware/functions";
import {
  Copy,
  Users,
  Clock3,
  CheckCircle2,
  Wallet,
  Check,
  ArrowRightLeft,
  UserPlus,
} from "lucide-react";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-700 ring-green-600/10";
    case "pending":
      return "bg-yellow-50 text-yellow-700 ring-yellow-600/10";
    case "expired":
      return "bg-neutral-50 text-neutral-600 ring-neutral-500/10";
    default:
      return "bg-neutral-50 text-neutral-600 ring-neutral-500/10";
  }
};

const ReferralDetails = () => {
  const { data: referralData, isLoading } = useGetReferralDetails();
  const [copiedField, setCopiedField] = useState<"code" | "link" | null>(null);

  const copyText = async (text: string, field: "code" | "link") => {
    await handleCopy(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <InlineLoadingScreen />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto py-5 px- sm:px-6 space-y-7 antialiased">
      <div className="relative px-2 md:px-0 ">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <UserPlus size={12} /> Share & Earn
        </div>
        <h1 className="text-base sm:text-3xl font-bold tracking-tight text-main-heading">
          Invite friends, unlock commissions
        </h1>
        <p className="mt-2 text-xs text-warning-700 leading-relaxed max-w-xl">
          Introduce your network to Soundmac. When they join a premium
          subscription plan, you automatically secure a recurring portion of
          their commission.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6 items-stretch">
        <div className="md:col-span-3 bg-white p-5 rounded-xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-main-heading">
              Personal Invite Link
            </h3>
            <p className="text-xs text-text-disable">
              Direct your audience anywhere via your custom onboarding string.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg p-1.5 pl-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <span className="text-xs text-neutral-400 font-medium select-none truncate max-w-[60px] sm:max-w-none">
              Link:
            </span>
            <input
              readOnly
              value={referralData?.referralLink ?? ""}
              placeholder="No link generated"
              className="flex-1 bg-transparent text-xs font-medium text-neutral-700 outline-none truncate"
            />
            <button
              disabled={!referralData}
              onClick={() =>
                referralData && copyText(referralData.referralLink, "link")
              }
              className="shrink-0 flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-neutral-50 active:scale-98 transition disabled:opacity-50"
            >
              {copiedField === "link" ? (
                <Check size={13} className="text-green-600" />
              ) : (
                <Copy size={13} />
              )}
              <span>{copiedField === "link" ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-main-heading">
              Checkout Code
            </h3>
            <p className="text-xs text-text-disable">
              For manual application during user signup.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 bg-secondary-50/60 border border-dashed border-neutral-200 rounded-lg px-4 py-2">
            <span className="font-mono font-bold tracking-wider text-sm text-main-heading">
              {referralData?.referralCode || "— — —"}
            </span>
            <button
              disabled={!referralData}
              onClick={() =>
                referralData && copyText(referralData.referralCode, "code")
              }
              className="text-primary hover:text-primary/80 font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1"
            >
              {copiedField === "code" ? (
                <Check size={13} className="text-green-600" />
              ) : (
                <Copy size={13} />
              )}
              {copiedField === "code" ? "Copied" : "Copy Code"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-sm division-x division-neutral-100 overflow-hidden grid grid-cols-2 lg:grid-cols-4">
        <div className="p-5 flex flex-col justify-between border-b border-r lg:border-b-0 border-neutral-100">
          <div className="flex items-center gap-2 text-xs font-medium text-text-disable">
            <Users size={14} className="text-neutral-400" />
            <span>Total Network</span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-main-heading mt-3">
            {referralData?.stats.totalReferrals ?? 0}
          </p>
        </div>

        <div className="p-5 flex flex-col justify-between border-b lg:border-b-0 border-neutral-100">
          <div className="flex items-center gap-2 text-xs font-medium text-text-disable">
            <Clock3 size={14} className="text-yellow-500" />
            <span>Pending Audits</span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-main-heading mt-3">
            {referralData?.stats.pendingReferrals ?? 0}
          </p>
        </div>

        <div className="p-5 flex flex-col justify-between border-r border-neutral-100">
          <div className="flex items-center gap-2 text-xs font-medium text-text-disable">
            <CheckCircle2 size={14} className="text-green-600" />
            <span>Converted Users</span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-main-heading mt-3">
            {referralData?.stats.completedReferrals ?? 0}
          </p>
        </div>

        <div className="p-5 flex flex-col justify-between bg-primary/[0.01]">
          <div className="flex items-center gap-2 text-xs font-medium text-text-disable">
            <Wallet size={14} className="text-primary" />
            <span>Net Earnings</span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-primary mt-3">
            ${(referralData?.stats.totalCommission ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <ArrowRightLeft size={16} className="text-neutral-400" />
          <h2 className="text-base font-semibold text-primary uppercase">
            invited friends
          </h2>
        </div>

        {referralData?.referrals.length ? (
          <div className="bg-white border border-neutral-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-neutral-100 max-h-[440px] overflow-y-auto scrollbar-hidden">
              {referralData.referrals.map((referral) => (
                <div
                  key={referral._id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Circle Avatar Alternative */}
                    <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0">
                      {referral.referred.firstName.charAt(0)}
                      {referral.referred.lastName.charAt(0)}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-semibold text-main-heading truncate">
                        {referral.referred.firstName}{" "}
                        {referral.referred.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator & Timestamp Column */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ring-inset uppercase tracking-wider ${getStatusStyles(
                        referral.status,
                      )}`}
                    >
                      {referral.status}
                    </span>
                    <span className="text-[10px] text-text-disable font-medium">
                      {new Date(referral.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-neutral-300 py-12 px-4 text-center">
            <div className="w-10 h-10 bg-neutral-50 rounded-full border border-neutral-200 flex items-center justify-center mx-auto mb-3">
              <Users size={16} className="text-neutral-400" />
            </div>
            <h4 className="font-semibold text-sm text-main-heading">
              Your ledger is empty
            </h4>
            <p className="text-text-disable mt-1 text-xs max-w-xs mx-auto leading-normal">
              Once users register under your unique credentials or click your
              reference link, their activity updates here instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralDetails;
