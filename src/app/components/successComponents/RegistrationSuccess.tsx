import Image from "next/image";
import Link from "next/link";
import React from "react";

const RegistrationSuccess = () => {
  return (
    <div>
      <div className="w-[70%] mx-auto text-center max-sm:w-[90%]">
        <h1 className="text-primary font-extrabold text-4xl leading-10 tracking-[0.5px] max-lg:text-2xl">
          {" "}
          Account Verified!
        </h1>
        <p className="text-p font-normal text-sm leading-5 tracking-[0.5px] mt-3">
          Welcome aboard! Your journey starts here.
        </p>
        <div className="border-2 border-dashed border-[#E1E1CF] my-10"></div>
        <div>
          <Image
            priority={true}
            src={"/document-upload-success.svg"}
            width={50}
            height={50}
            alt="a document with a check mark"
            className="h-full w-full object-cover"
          />
        </div>
        <Link
          href={"/dashboard"}
          className={
            " w-[20%] text-white! font-semibold px-4 py-2 rounded-lg transition hover:cursor-pointer bg-primary hover:bg-primary/80"
          }
        >
          Proceed to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
