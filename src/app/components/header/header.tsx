'use client'
import Link from "next/link";
import { navigationLinks } from "../../utils/constants";
import classes from './header.module.css'
import { usePathname } from 'next/navigation';
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { Fragment, useState } from "react";


export default function Header() {
    const pathname = usePathname();
    const [modal, setModal] = useState(false)
    const toggleModal = () => {
        setModal(prev => !prev)
    }

    return (
        <header className={`${classes.container} ${modal ? classes.containerActive : ''}`}>
            <GiHamburgerMenu onClick={toggleModal} className={classes.hamburgerIcon} />
            <Link href={'/'} className={classes.logo}>S O U N D M A C</Link>
            {modal && <div className={classes.overlay} />}
            <nav className={`${classes.navGroup} ${!modal ? classes.navGroupInactive : ''}`}>
                <IoMdClose onClick={toggleModal} className={classes.hamburgerIcon} />
                {navigationLinks.map((nav, index) => (
                    <Fragment key={index}>
                        <Link onClick={toggleModal} className={`${classes.link} ${pathname === nav.link ? classes.activeLink : ''}`} href={nav.link} >{nav.name}</Link>
                        <div className={classes.mobileHorizontalLine} />
                    </Fragment>
                ))}
                <>
                    <button className={classes.loginBtn}>Login</button>
                    <div className={classes.mobileHorizontalLine} />
                    <button className={`${classes.loginBtn} ${classes.registerBtn}`}>Register</button>
                </>

            </nav>


        </header>
    )
}