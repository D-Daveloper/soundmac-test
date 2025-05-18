import Link from 'next/link';
import { quickLinks, socialMediaMapping } from './constants'
import classes from './footer.module.css'

export function Footer() {
    const thisYear = new Date().getFullYear()

    return (
        <footer className={classes.container}>
            <div className={classes.topContainer}>
                <p className={classes.logo}>S O U N D M A C</p>
                <p className={classes.copyrightText}>Copyright: © {thisYear} SoundMac - All Rights Reserved</p>
                <div className={classes.socialMediaMappingContainer}>
                    {socialMediaMapping.map((item, index) => {
                        const isEmail = item.name === "EMAIL";
                        return isEmail ? (
                            <a
                                href={`mailto:${item.emailAddress}`}
                                key={index}
                            >
                                {item.name}
                            </a>
                        ) : (
                            <a
                                href={item.url}
                                key={index}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {item.name}
                            </a>
                        );
                    })}
                </div>
            </div>
            <div className={classes.bottomContainer}>
                <div className={classes.bottomSubContainer}>
                    {Object.keys(quickLinks).map((item, index) => (
                        <div key={index}>
                            <p className={classes.quickLinkHeader}>{item}</p>
                            <div className={classes.quickLinkItem}>
                            {quickLinks[item].map((i, idx)=>(
                                <Link href={i.link} key={idx}>{i.name}</Link>
                            ))}
                            </div>
                        </div>

                    ))}
                </div>
            </div>
        </footer>
    )
}