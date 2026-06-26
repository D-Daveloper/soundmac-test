"use client";
import { SongForm } from "@/app/type";
import Image from "next/image";
import React, { useState } from "react";

interface Props {
  title: string;
  image?: string | null;
  required?: boolean;
  name: string;
  updateValue: (e: React.ChangeEvent<HTMLInputElement>,index:number,field:keyof SongForm) => void;
  value: string;
  placeholder: string;
  type?: string;
  alt?: string;
  disabled?:boolean
  index:number;
  field:keyof SongForm
}

const DynamicInput = React.memo(({
  image = null,
  type = "text",
  required = false,
  alt = "",
  updateValue,
  ...props
}: Props) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <div className="flex gap-1 sm:text-sm text-lg mt-1">
        <p className=" capitalize font-medium text-sm">{props.title} </p>
        {required && (
           <span className="text-red-500">*</span>
          // <Image
          //   priority={false}
          //   loading="lazy"
          //   src="/required.svg"
          //   alt="a star marking this field as required"
          //   width={0}
          //   height={0}
          //   className="w-2 -mt-3"
          // />
        )}
      </div>
      <div className={"flex px-3 rounded-lg border-transparent border-10 outline-1 gap-3 mt-2 sm:text-sm text-[16px] " + ( props.disabled && " text-text-disable bg-neutral-50")}>
        {image && (
          <Image
            src={image}
            alt={alt}
            width={0}
            height={0}
            className="w-5"
            priority={false}
            loading="lazy"
          />
        )}
        <input
        disabled={props.disabled}
          onChange={(e) => {updateValue(e,props.index,props.field)}}
          name={props.name}
          required={required}
          value={props.value}
          type={
            type === "password" ? (isOpen ? "text" : "password") : type
          }
          placeholder={props.placeholder}
          className="w-[90%] outline-0 font-normal placeholder:font-extralight "
        />
        {type === "password" &&
          (isOpen ? (
            <button
              type="button"
              className="hover:cursor-pointer"
              onClick={handleClick}
            >
              <Image
                priority={false}
                loading="lazy"
                src={"/eye.svg"}
                alt="an eye showing password is visible"
                width={0}
                height={0}
                className="w-5"
              />
            </button>
          ) : (
            <button
              type="button"
              className="hover:cursor-pointer"
              onClick={handleClick}
            >
              <Image
                priority={false}
                loading="lazy"
                src={"/eyeslash.svg"}
                alt="an eye showing password is invisible"
                width={0}
                height={0}
                className="w-5"
              />
            </button>
          ))}
      </div>
    </>
  );
});

export default DynamicInput;
