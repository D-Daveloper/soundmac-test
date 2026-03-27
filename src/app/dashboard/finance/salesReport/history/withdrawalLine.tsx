import React from "react";

export type Props = {
  status: "pending" | "successful" | "failed";
  amount: string;
  account_number: string;
  date: string;
};

const WithdrawalLine = (Props: Props) => {
  return (
    <div className="bg-neutral-50 border border-neutral-100 w-full p-5 gap-5 h-fit rounded-4xl flex justify-between items-center flex-wrap">
      {/* status and amount */}
      <div className="flex gap-7 justify-start min-w-fit  flex-1">
        <p
          className={
            "font-bold leading-[18px] tracking-tighter text-xs capitalize w-fit px-4 py-1 h-fit rounded-full flex-1 max-w-fit " +
            (Props.status === "pending"
              ? " text-warning-500 bg-warning-100"
              : Props.status === "successful"
                ? " text-success-500 bg-success-100"
                : Props.status === "failed"
                  ? " text-error-500 bg-error-100"
                  : " text-primary-500 bg-primary-50")
          }
        >
          {Props.status}
        </p>
        <p className="font-bold leading-[30px] -tracking-[1px] text-2xl text-primary-500 flex-1">
          ₦{Props.amount}
        </p>
      </div>
      {/* account number */}
      <div className=" flex-1 min-w-fit ">
        <p
          className={
            "text-disable font-light text-xl leading-6 tracking-tighter"
          }
        >
          To bank account XXXXXX{Props.account_number.slice(-4)}
        </p>
      </div>
      {/* date and time */}
      <div className=" min-w-fit flex-1 gap-7 text-text-body font-semibold text-md leading-5 tracking-tighter">
        <div className="flex bg-secondary-50 max-w-fit p-3 rounded-full gap-2">
          <p>{new Date(Props.date).toDateString()}</p>
          <p className="">{new Date(Props.date).toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalLine;
