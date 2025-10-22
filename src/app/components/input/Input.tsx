"use client";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useState } from "react";

interface Props {
  title: string;
  image?: string | null;
  required?: boolean;
  name: string;
  updateValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  placeholder: string;
  type?: string;
  alt?: string;
}

const Input = ({
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
      <div className="flex gap-1 sm:text-sm text-lg">
        <p className=" capitalize font-medium">{props.title} </p>
        {required && (
          <Image
            priority={false}
            loading="lazy"
            src="/required.svg"
            alt="a star marking this field as required"
            width={0}
            height={0}
            className="w-2 -mt-3"
          />
        )}
      </div>
      <div className="flex px-3 rounded-lg border-[#E8E8E8] border-10 outline-1 gap-3 mt-2 sm:text-sm text-lg">
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
          onChange={updateValue}
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
};

export default Input;
