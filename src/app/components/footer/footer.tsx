import Link from "next/link";
import {
  FaYoutube,
  FaTiktok,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaXTwitter,
  FaSpotify,
} from "react-icons/fa6";
import { IoChevronDown } from "react-icons/io5";
import {
  quickLinks,
  socialMediaMapping,
  legalLinks,
  contactInfo,
} from "./constants";
import classes from "./footer.module.css";
import soundmacLogo from "@/assets/images/soundmacsLogo.png";
import Image from "next/image";

const iconMap: Record<string, React.ReactNode> = {
  youtube: <FaYoutube />,
  tiktok: <FaTiktok />,
  instagram: <FaInstagram />,
  facebook: <FaFacebookF />,
  linkedin: <FaLinkedinIn />,
  x: <FaXTwitter />,
  spotify: <FaSpotify />,
};

export function Footer() {
  const thisYear = new Date().getFullYear();

  return (
    <footer className={classes.container}>
      <div className={classes.topContainer}>
        {/* Left: logo + language selector */}
        <div className={classes.brandColumn}>
          <div className="flex items-center gap-x-2">
            <Image
              src={soundmacLogo}
              alt="soundmac logo"
              width={20}
              height={20}
              className="invert brightness-200"
            />
            <p className=""> SOUNDMAC </p>
          </div>
          <button className={classes.languageSelector}>
            <span className={classes.flag}>🇬🇧</span>
            English
            <IoChevronDown />
          </button>
        </div>

        {/* Middle: quick links columns */}
        {Object.keys(quickLinks).map((item, index) => (
          <div key={index} className={classes.linkColumn}>
            <p className={classes.quickLinkHeader}>{item}</p>
            <div className={classes.quickLinkItem}>
              {quickLinks[item].map((i, idx) => (
                <Link href={i.link} key={idx}>
                  {i.name}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Right: contact */}
        <div className={classes.linkColumn}>
          <p className={classes.quickLinkHeader}>Contact</p>
          <div className={classes.quickLinkItem}>
            <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}>
              {contactInfo.phone}
            </a>
            <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
          </div>
        </div>
      </div>

      <div className={classes.bottomContainer}>
        <div className={classes.bottomLeft}>
          <p className={classes.copyrightText}>
            © Soundmac Music Group LTD - All rights reserved
          </p>
          <div className={classes.legalLinks}>
            {legalLinks.map((item, idx) => (
              <Link href={item.link} key={idx}>
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className={classes.socialMediaMappingContainer}>
          {socialMediaMapping.map((item, index) => (
            <a
              href={item.url}
              key={index}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.name}
              className={classes.socialIcon}
            >
              {iconMap[item.icon]}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// import Link from 'next/link';
// import { quickLinks, socialMediaMapping } from './constants'
// import classes from './footer.module.css'

// export function Footer() {
//     const thisYear = new Date().getFullYear()

//     return (
//         <footer className={classes.container}>
//             <div className={classes.topContainer}>
//                 <p className={classes.logo}>S O U N D M A C</p>
//                 <p className={classes.copyrightText}>Copyright: © {thisYear} SoundMac - All Rights Reserved</p>
//                 <div className={classes.socialMediaMappingContainer}>
//                     {socialMediaMapping.map((item, index) => {
//                         const isEmail = item.name === "EMAIL";
//                         return isEmail ? (
//                             <a
//                                 href={`mailto:${item.emailAddress}`}
//                                 key={index}
//                             >
//                                 {item.name}
//                             </a>
//                         ) : (
//                             <a
//                                 href={item.url}
//                                 key={index}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                             >
//                                 {item.name}
//                             </a>
//                         );
//                     })}
//                 </div>
//             </div>
//             <div className={classes.bottomContainer}>
//                 <div className={classes.bottomSubContainer}>
//                     {Object.keys(quickLinks).map((item, index) => (
//                         <div key={index}>
//                             <p className={classes.quickLinkHeader}>{item}</p>
//                             <div className={classes.quickLinkItem}>
//                             {quickLinks[item].map((i, idx)=>(
//                                 <Link href={i.link} key={idx}>{i.name}</Link>
//                             ))}
//                             </div>
//                         </div>

//                     ))}
//                 </div>
//             </div>
//         </footer>
//     )
// }
