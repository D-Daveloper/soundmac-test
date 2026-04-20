'use client'
import React from "react";

const Notification = ({title,description,createdAt,statusWeight,onClick}:{title:string,description:string,createdAt:Date,statusWeight:number,onClick:()=> void}) => {
  return (
    <button 
    disabled={statusWeight != 1}
    onClick={()=> onClick()}
     className={"text-left rounded-lg  p-4 " + (statusWeight === 1? " bg-neutral-50" : " bg-neutral-50/50")}>
      <h2 className="text-xl text-main-icon-color font-semibold mb-5">
        {title}
      </h2>
      <p className="mb-5 break-words">
        {description}
      </p>
      <p className="rounded-full font-bold p-2 text-main-icon-color bg-primary-50 w-fit text-sm">
        {new Date(createdAt).toDateString()}
      </p>
    </button>
  );
};

export default Notification;
