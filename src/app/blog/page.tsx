"use client";
import { SearchIcon } from "lucide-react";
import React, { Fragment } from "react";
import { blogContent, categories } from "../constant";
import blogimag1 from "../../assets/images/blog.png";
import Image from "next/image";
import "./blog.css";

const Blog = () => {
  return (
    <section className="min-w-full bg-[#E7E7E7] ">
      <div className="max-w-[80%] mx-auto max-sm:max-w-[90%]">
        <div className="flex flex-col gap-5 justify-center items-center mb-20">
          <h1 className="mt-32 text-center font-bold text-xl">
            Welcome to the SOUNDMAC Blog
          </h1>
          <p className="text-[#5E5E5E] text-center">
            Your ultimate resource for navigating the ever-evolving music
            industry.
          </p>
          {/* <input type="text" className='bg-black min-w[60%]' /> */}
          <form className="p-5 flex bg-[#cfcfcf] rounded-2xl h-16 justify-center items-center min-w-[80%] ">
            <input
              type="text"
              name="search"
              placeholder="Search"
              className="w-full h-full focus:outline-0"
            />
            <button type="submit">
              <SearchIcon className="w-12" />
            </button>
          </form>
          <div className="flex gap-5 flex-wrap max-md:justify-center ">
            {categories.map((item, index) => (
              <TextBox text={item} key={index} />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-5 mb-20 items-center justify-center max-md:justify-center">
          {blogContent.map((item) => (
            <BlogCard key={item.id} title={item.title} content={item.content} />
          ))}
        </div>
        <button className="mx-auto block">
          {" "}
          <TextBox text={"Load more"} />
        </button>
      </div>
    </section>
  );
};

export default Blog;
interface TextBoxProps {
  text: string;
}
const TextBox: React.FC<TextBoxProps> = ({ text }) => {
  return (
    <div className="bg-[#cfcfcf] rounded-4xl">
      <p className="text-[#5E5E5E] capitalize p-5">{text}</p>
    </div>
  );
};

interface BlogCardProps {
  id?: number;
  title: string;
  content: string;
}

const BlogCard = ({ title, content }: BlogCardProps) => {
  return (
    <div className="bg-white w-[300px] lg:h-[500px] h-[300px] max-md:w-[200px] max-sm:h-[250px] flex flex-col rounded-2xl hover:cursor-pointer justify-between card">
      <div>
        <Image
          src={blogimag1}
          alt="blog"
          className="card_image object-cover rounded-md w-full"
        />
        <div className="flex flex-col gap-3 mt-5 px-5 pb-5">
          <p className="text-xs text-gray-500">
            18 min read | March 29, 2025 | 2.8K shares
          </p>
          <h2 className="font-bold line-clamp-1 max-sm:text-sm">{title}</h2>
          <p className="text-sm text-gray-500 line-clamp-5 max-sm:line-clamp-2 max-sm:text-xs">
            {content}
          </p>
        </div>
      </div>
      <button className="mx-auto block bg-[#cfcfcf] rounded-xl max-sm:hidden mb-10">
        <TextBox text={"Learn more"} />
      </button>
    </div>
  );
};
