'use client'
import Link from "next/link";
import { linkRoutes, navigationLinks } from "../../utils/constants";
import classes from './header.module.css'
import { usePathname, useRouter } from 'next/navigation';
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { Fragment, useContext, useState } from "react";
import UserContext from "@/app/context/userContext/userContext";
import { NormalLoadingScreen } from "../Loader/loader";
import { USER } from "@/app/context/userContext/types";


export default function Header() {
    const router = useRouter()
    const userContext = useContext(UserContext)
    const token = userContext?.token
    const pathname = usePathname();
    const [modal, setModal] = useState(false)
    const [gettingUser, setGettingUser] = useState(false)
    const toggleModal = () => {
        setModal(prev => !prev)
    }

    const onSuccess = (user: USER) => {
        console.log(user)
        const userRole: string = user?.role;
        const location = linkRoutes.artists[userRole]
        router.push(location)
    }

    const onError = (error: unknown) => {
        userContext?.handleAPIError(error)
    }

    const move = () => {
        userContext?.getUser(setGettingUser, onSuccess, onError)
    }

    return (
        <header className={`${classes.container} ${modal ? classes.containerActive : ''}`}>
            {gettingUser && <NormalLoadingScreen />}
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
                {
                    token ?
                        <button onClick={move} className={`${classes.loginBtn} ${classes.loginBtn}`}>Dashboard</button>
                        :
                        <>
                            <Link href={linkRoutes.SignIn} className={classes.loginBtn}>Login</Link>
                            <div className={classes.mobileHorizontalLine} />
                            <Link href={linkRoutes.SignUp} className={`${classes.loginBtn} ${classes.registerBtn}`}>Register</Link>
                        </>

                }


            </nav>


        </header>
    )
}