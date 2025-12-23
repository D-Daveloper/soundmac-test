import { Music } from "lucide-react";
import React from "react";

const ViewStatsCard = () => {
  return (
    <div className="bg-main-white rounded-lg flex p-5 max-w-[250px] w-full h-[100px] justify-between flex-col max-sm:max-w-full">
      <div className="flex gap-3">
        <Music color="#103958" strokeWidth={1} />
        <h2 className="font-normal text-sm leading-[18px] tracking-[0.5px] text-disable">
          Total Releases
        </h2>
      </div>
      <p className="font-semibold text-primary text-3xl leading-[40px] tracking-[-1px] ml-auto">
        94
      </p>
    </div>
  );
};

export default ViewStatsCard;
