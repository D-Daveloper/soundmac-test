import React from "react";
import Convert from "../app/components/LandingPage/Convert/page";
import Pricing from "./components/LandingPage/Pricing/page";
import Promotion from "./components/LandingPage/Promotion/page";
import Features from "./components/LandingPage/Features/page";
// import Blog from './components/LandingPage/Blog/page'
import HomeSection from "./components/LandingPage/Home/page";

const Home = () => {
  return (
    <div className="bg-white">
      <section id="home">
        <HomeSection />
      </section>

      <section id="features">
        <Features />
      </section>

      <section id="pricing">
        <Pricing />
      </section>

      <section id="promotion">
        <Promotion />
      </section>

      {/* <section id="blog">
        <Blog />
      </section> */}

      <section id="convert">
        <Convert />
      </section>
    </div>
  );
};

export default Home;

// import classes from "./page.module.css";
// import heroImage from '../assets/images/heroImage.png'
// import funImageTwo from '../assets/images/girlPressingPhone.png'
// import funImageOne from '../assets/images/image3.png'
// import groupedDSP from '../assets/images/dsp.png'
// import Image from "next/image";
// import { AYNCardProps } from "./type";
// import { AYNCardItems } from "./constant";
// import { FaQuoteLeft, FaQuoteRight, FaStar } from "react-icons/fa";

// export default function Home() {

//   return (
//     <div className={classes.container}>
//       <HeroSection />
//       <FunSection />
//       <AYNSection />
//       <TestimonialSection />
//       <Prompt />
//     </div>
//   );
// }

// function HeroSection() {
//   return (
//     <section className={classes.heroSectionContainer}>
//       <Image src={heroImage} alt="hero image" className={classes.heroImage} />
//       <h3 className={classes.heroSectionName}>S O U N D M A C . C O</h3>
//       <h4 className={classes.heroSectionTitle}>Earn While Global Listeners Enjoy Your Music</h4>
//       <h5 className={classes.heroSectionSubTitle}>Distribute your music with one of the fastest-rising music distribution companies in the world!</h5>
//     </section>
//   )
// }

// function FunSection() {
//   return (
//     <section className={classes.funSectionContainer}>
//       <div className={classes.firstFunSection}>
//         <Image src={groupedDSP} alt="grouped DSP icons" className={classes.groupedDSPIcon} />
//         <p className={classes.funTextOne}>We distribute music across all streaming platforms like Spotify, Apple, Audiomack, YouTube, etc</p>

//         <div className={classes.funImage1Container}>
//           <Image src={funImageOne} alt="fun image one(1)" className={classes.funImage1} />
//         </div>
//       </div>

//       <div className={classes.secondFunSection}>
//         <Image src={funImageTwo} alt="fun image two(2)" className={classes.funImage2} />
//       </div>

//     </section>
//   )
// }

// function AYNSection() {
//   return (
//     <section className={classes.AYNSectionContainer}>
//       <h4 className={classes.AYNSectionContainerHeading}>We Have Everything You Need To Succeed.</h4>
//       <div className={classes.AYNSectionContainerGroup}>
//         {
//           AYNCardItems.map((item, index) => (
//             <AYNCard key={index} index={index} title={item.title} subTitle={item.subTitle} />
//           ))
//         }
//       </div>
//     </section>
//   )
// }

// function TestimonialSection() {
//   return (
//     <section className={classes.testimonialSectionContainer}>

//       <div className={classes.leftTestimonials}>
//         <div className={classes.topTestimonials}>
//           <div className={classes.testimonialOne}>
//             <FaQuoteLeft className={classes.testimonialOneQuote} />
//             <div className={classes.successMuchImageContainer}>
//               <Image width={100} height={100} src={'https://sconchun.sirv.com/image-3.svg'} alt="lady" className={classes.successMuchImage} />
//             </div>
//             <div className={classes.testimonialOneWordsContainer}>
//               <h3 className={classes.testimonialOneWordsContainerH3}>The best!</h3>
//               <p className={classes.testimonialOneWordsContainerP}>SoundMac{"'"}s music distribution tips and industry insights have been invaluable in helping me grow my fanbase and maximize my streaming revenue. </p>
//               <p className={classes.nameSignage}>SuccessMuch</p>
//             </div>
//           </div>

//           <div className={classes.testimonialTwo}>
//             <div className={classes.summerBoyImageContainer}>
//               <Image width={100} height={100} src={'https://sconchun.sirv.com/image-2.svg'} alt="lady" className={classes.successMuchImage} />
//             </div>
//             <div className={classes.testimonialTwoCard}>
//               <div className={classes.starsGroup}>
//                 {Array.from({ length: 5 }).map((_, index) => (
//                   <FaStar key={index} className={`${classes.star} ${index === 2 ? classes.middleStar : ''}`} />
//                 ))}
//               </div>
//               <h3 className={classes.testimonialOneWordsContainerH3}>I really appreciate!</h3>
//               <p className={classes.testimonialOneWordsContainerP}>I was blown away by SoundMac{"'"}s free online audio converter.</p>
//               <p className={classes.nameSignage}>SvmmerBoy</p>
//             </div>
//             <FaQuoteRight className={classes.testimonialTwoQuote} />
//           </div>
//         </div>

//         <div className={classes.testimonialFive}>
//           <h3 className={classes.testimonialOneWordsContainerH3}>Artists Love SoundMac!</h3>
//           <p className={`${classes.testimonialOneWordsContainerMiddleP} ${classes.testimonialOneWordsContainerMiddlePMobile}`}>SoundMac helped me reach fans I never knew I had. My streams have increased by 300% since switching to their platform.</p>

//           <div className={classes.testimonialFiveGroupDownImages}>
//             <div className={classes.summerBoyImageContainerTwo}>
//               <Image width={100} height={100} src={'https://sconchun.sirv.com/image-3.svg'} alt="lady" className={classes.successMuchImageTwo} />
//             </div>

//             <div className={`${classes.summerBoyImageContainerTwo} ${classes.summerBoyImageContainerTwoWithMarginTop}`}>
//               <Image width={100} height={100} src={'https://sconchun.sirv.com/image-2.svg'} alt="lady" className={`${classes.successMuchImageTwo} ${classes.successMuchImageTwoBigger}`} />
//             </div>

//             <div className={classes.summerBoyImageContainerTwo}>
//               <Image width={100} height={100} src={'https://sconchun.sirv.com/image-1.svg'} alt="lady" className={classes.successMuchImageTwo} />
//             </div>

//           </div>
//         </div>
//       </div>

//       <div className={classes.middleTestimonials}>
//         <div className={classes.testimonialThree}>
//           <Image width={100} height={100} src={'https://sconchun.sirv.com/image.svg'} alt="lady" className={classes.middleLadyImage} />
//           <p className={classes.testimonialOneWordsContainerMiddleP}>SoundMac{"'"}s white label services have allowed us to offer our own branded music distribution solution to our clients.</p>
//         </div>

//         <div className={classes.testimonialSix}>
//           <Image width={100} height={100} src={'https://sconchun.sirv.com/image-1.svg'} alt="lady" className={`${classes.successMuchImageTwo} ${classes.successMuchImageTwoBigger}`} />
//           <div className={`${classes.starsGroup} ${classes.starsGroupSix}`}>
//             {Array.from({ length: 5 }).map((_, index) => (
//               <FaStar key={index} className={`${classes.star} ${index === 2 ? classes.middleStar : ''}`} />
//             ))}
//           </div>
//           <p className={`${classes.testimonialOneWordsContainerMiddleP} ${classes.testimonialOneWordsContainerMiddlePMobile}`}>SoundMac has been a game changer for my music. Affordable music distribution pricing plans.</p>
//         </div>
//       </div>

//       <div className={classes.rightTestimonials}>

//         <div className={classes.testimonialFour}>
//           <div className={`${classes.summerBoyImageContainerTwo} ${classes.summerBoyImageContainerFour}`}>
//             <Image width={100} height={100} src={'https://sconchun.sirv.com/image-4.svg'} alt="lady" className={`${classes.successMuchImageTwo} ${classes.successMuchImageTwoBigger}`} />
//           </div>

//           <div className={classes.testimonialFourCard}>
//             <p className={`${classes.testimonialOneWordsContainerMiddleP} ${classes.testimonialOneWordsContainerMiddlePMobile}`}> Their affordable music distribution pricing plans have allowed me to pay using my local bank card and to reach a global audience on platforms like Spotify, Apple Music, and TikTok.</p>
//           </div>
//         </div>

//         <div className={classes.testimonialSeven}>
//           <Image width={100} height={100} src={'https://sconchun.sirv.com/image-ceo.svg'} alt="lady" className={classes.aCEOImage} />

//           <div>
//             <p className={classes.testimonialOneWordsContainerP}>We integrated SoundMac&apos;s music distribution API into our own platform, and it&apos;s been a seamless experience.</p>
//             <p className={classes.nameSignage}>C.E.O Febi Music Distribution</p>
//           </div>
//         </div>

//         <div className={`${classes.testimonialSeven} ${classes.lastTestimonial}`}>
//           <p className={`${classes.testimonialOneWordsContainerP} ${classes.lastTestimonialP}`}>Their music distribution API has streamlined our workflow, allowing us to focus on what matters most - finding and promoting new talent.</p>
//           <div className={classes.imageCon}>
//             <Image width={100} height={100} src={'https://sconchun.sirv.com/image-4.svg'} alt="lady" className={classes.successMuchImage} />
//             <p className={classes.nameSignage}>Jb Records</p>
//           </div>
//         </div>

//       </div>

//     </section>
//   )
// }

// function AYNCard(props: AYNCardProps) {
//   return (
//     <div className={classes.AYNCard}>
//       <p className={classes.AYNCardTitle}><span>{props.index + 1}. </span>{props.title}</p>
//       <p className={classes.AYNCardSubTitle}>{props.subTitle}</p>
//     </div>
//   )
// }

// function Prompt() {
//   return (
//     <section className={classes.promptSectionContainer}>
//       <h3 className={classes.promptTitle}>Ready to Share Your Music With the World?</h3>
//       <h4 className={classes.promptSubTitle}>No credit card required to sign up</h4>
//       <p className={classes.promptSubTitleP}>Join thousands of independent artists who are building successful careers with SoundMac.</p>

//       <button className={classes.getStartedBtn}>Get Started Today!</button>
//     </section>
//   )
// }
