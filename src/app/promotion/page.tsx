"use client";
import { SearchIcon } from "lucide-react";
import React from "react";
import { promotionContent, categories } from "../constant";
// import blogimag1 from "../../assets/images/blog.png";
// import Image from "next/image";

const Promotion = () => {

  return (
    <section className="min-w-full bg-[#E7E7E7] ">
      <div className="max-w-[80%] mx-auto">
        <div className="flex flex-col gap-5 justify-center items-center mb-20">
          <h1 className="mt-32 text-center font-bold text-xl">
            Welcome to SOUNDMAC Promotion Page
          </h1>
          <p className="text-[#5E5E5E]">
            Don't just create music push it to the world. Consistency and
            promotion are the keys to success.
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
        <div className="flex flex-wrap gap-5 mb-20 items-center justify-center">
          {promotionContent.map((item) => (
            <BlogCard
              key={item.id}
              title={item.title}
              content={item.content}
              image={item.image}
              category={item.category}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Promotion;
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

interface PromotionCardProps {
  id?: number;
  title: string;
  content: string;
  image: string;
  category: string;
}

const BlogCard = ({ title, content, image,category }: PromotionCardProps) => {
  return (
    <div className="bg-white w-[300px] h-[450px] flex justify-between items-start flex-col rounded-2xl pb-5">
      <img
        src={image}
        alt="blog"
        className="w-full object-cover rounded-md h-60"
      />
      <div className="flex flex-col gap-3 mt-5 px-5 mb-5">
        <h2 className="font-bold line-clamp-1">{title}</h2>
        <p className="text-sm text-gray-500 line-clamp-5">{content}</p>
      </div>
      <a href={`/promotion/${category}`} className="mx-auto block bg-[#cfcfcf] rounded-xl ">
        <TextBox text={"Get started"} />
      </a>
    </div>
  );
};
