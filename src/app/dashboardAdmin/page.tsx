"use client";

import Dashboard from "./dashboard/Dashboard";

const page = () => {

  return (
    <main className="section h-full relative bg-main-white text-[14px] -tracking-[0.5px] leading-5 transition-all duration-300 ease-in-out lg:ml-[250px]">
     <Dashboard/>
    </main>
  );
};

export default page;