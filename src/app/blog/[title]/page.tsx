// import { Link, useNavigate, useParams } from "react-router-dom";
// import { home_post } from "../data/index";
// import Loader from "../../blogComponents/LoaderComponent";
// import DOMPurify from 'dompurify';
// import { Helmet } from "react-helmet-async";
// import logo2 from "../../assets/icons/logo192.png";
"use client";

import React, { useEffect, useState } from "react";
import logo from "../../../assets/images/soundmacsLogo.png";
import { MoveDown, Share2 } from "lucide-react";
import axios from "axios";
import "../../blog/blog.css";
import { blogContent } from "@/app/constant";
import { useParams } from "next/navigation";
import { BLOG_CONTENT } from "@/app/type";
import { NormalLoadingScreen } from "@/app/components/Loader/loader";
import Link from "next/link";
import Image from "next/image";

const BlogPost = () => {
  const url =
    process.env.REACT_APP_BACKEND_SERVER_URL || "http://localhost:4000/api/v1";
  const { title } = useParams(); // Extract the article ID from the URL
  const [article, setArticle] = useState<BLOG_CONTENT | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BLOG_CONTENT[]>([]);
  //   const navigate = useNavigate();

  //   function slugify(title) {
  //     return title
  //       .toLowerCase()
  //       .trim()
  //       .replace(/[\s]+/g, '-') // Replace spaces with dashes
  //       .replace(/[^\w-]+/g, ''); // Remove special characters
  //   }
  const handleShare = async (item: BLOG_CONTENT) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.content,
          url: "/posts/" + item.slug,
        });
        await axios.post(`${url}/posts/${item.id}/share`);
      } catch (error) {
        console.error("Error sharing", error);
      }
    } else {
      alert("browser not supported");
    }
  };

  // useEffect(()=> {
  //   const getParticularPost = async () => {
  //     console.log(encodeURIComponent(Title));
  //     console.log(Title);
  //     try {
  //       const response = await axios.get(`${url}/posts/${encodeURIComponent(Title)}`);
  //       setArticle(response.data)
  //       // console.log(response.data)
  //     } catch (error) {
  //       console.log(error.message)
  //     }finally{
  //       setLoading(false)
  //     }
  //   };
  //   getParticularPost();
  // }, [Title]);

  useEffect(() => {
    const allPosts = async () => {
      try {
        console.log(post);

        const mainPost = post.find((item) => {
          return item.slug == title;
        });
        setArticle(mainPost);
        console.log(mainPost);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    allPosts();
    setPost(blogContent);
    setLoading(false);
  }, [title, post, loading]);

  if (!article || loading) {
    return <NormalLoadingScreen />;
  }
  //   const handleViewBlog = (title) => {
  //     const slug = slugify(title); // Generate slug
  //     navigate(`/posts/${slug}`);
  //   };
  //   const formattedDate = new Date(article.date).toISOString().split('T')[0];
  //   const blogDescription = article.content;

  return (
    <div>
      {/* <Helmet>
        <title>{article.Title}</title>
        <meta
          name="description"
          content={blogDescription}
        />
        <link rel="canonical" href={`/posts/${blogTitle}`} />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="Music distribution, Industry news, Africa artists, Fan base"/>
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`/posts/${blogTitle}`} />
        <meta property="og:image" content={logo2} />
        <meta name="twitter:card" content="summary_large"/>
      </Helmet> */}
      <section className="py-10 max-w-[90%] mx-auto">
        <div className=" pb-6">
          <div className="text_color font-semibold flex">
            <p className="underline">
              <Link href="/blog" className="inline">
                Blog
              </Link>
            </p>
            {">"}{" "}
            <Link href="/blog">
              <p className="underline flex">Post</p>
            </Link>{" "}
            {">"}{" "}
            <p>
              <MoveDown />
            </p>
          </div>
          <article>
            <h1 className="text-2xl font-bold leading-normal text-text md:text-[2.8vw]">
              {article.title}
            </h1>
            <div className="flex gap-3 py-6">
              <Image
                src={logo.src}
                alt="logo"
                className="rounded-full bg-black object-center"
                width={50}
                height={30}
              />
              <div>
                <h3>Soundmac</h3>
                <p>Published 02/12/2015</p>
              </div>
            </div>
            <div>
              <div className="">
                <Image
                  width={100}
                  height={0}
                  src={logo.src}
                  alt="main blog post primary image"
                  className="rounded-[20px] max-h-[650px] w-full object-cover"
                />
              </div>
              <div className="my-10 grid grid-cols-1 gap-8 text-justify prose ">
                <div
                  className="list-decimal"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                <div
                  className="list-decimal"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
              <div className="grid gap-8">
                <div className="grid grid-cols-1 gap-8">
                  <Image
                  width={100}
                  height={0}
                    src={logo.src}
                    alt="main blog post secondary image"
                    className="rounded-[20px] max-h-[650px] w-full object-cover"
                  />
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
                <div className="grid grid-cols-1 gap-8">
                  <Image
                  width={100}
                  height={0}
                    src={logo.src}
                    alt="main blog post secondary image"
                    className="rounded-[20px] max-h-[650px] w-full object-cover"
                  />
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
              </div>
            </div>
          </article>
        </div>
        <hr className="border-1 my-10 border-gray-800" />
        <div className="p-6">
          <h1 className="text-2xl font-bold leading-normal text-text md:text-[2.8vw] mb-3">
            view other related posts
          </h1>
          <div className="flex flex-wrap gap-3">
            {post
              .filter((item) => item.slug != article.slug)
              .slice(0, 3)
              .map((item, index) => (
                <article
                  key={index}
                  className="rounded-2xl bg-white hover:shadow-lg w-[300px] p-3 max-md:w-full"
                >
                  <a
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    className="flex gap-3 justify-between flex-col"
                  >
                    <div className="mb-4 flex gap-4">
                      <Image
                        src={logo.src}
                        alt="Blog post image"
                        className=" object-cover "
                        width={50}
                        height={40}
                      />
                      <h2 className="font-bold leading-normal text-text line-clamp-2">
                        {item.title}
                      </h2>
                    </div>

                    <p className="mb-3 text-sm flex gap-2 justify-between">
                      12/03/2013
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => {
                            handleShare(item);
                          }}
                        >
                          <Share2
                            stroke="#10414A"
                            className={"hover:scale-110 focus:scale-110"}
                            width={10}
                            height={10}
                          />
                        </button>
                        {20}
                      </div>
                    </p>
                  </a>
                </article>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
