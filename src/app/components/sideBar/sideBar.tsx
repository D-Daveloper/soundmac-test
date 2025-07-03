import Link from 'next/link'
import classes from './sideBar.module.css'
import UserContext from '@/app/context/userContext/userContext';
import { useContext } from 'react';
import { LOCATION_TREE } from '@/app/utils/constants';
import { usePathname } from 'next/navigation';
import { profileDropDown } from './constant';

// Arrow icon component
const ArrowIcon = () => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={classes.arrowIcon}
    >
        <path
            d="M7 10L12 15L17 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default function SideBar() {
    const userContext = useContext(UserContext)
    const userRole = userContext?.user?.role || ""
    const items = LOCATION_TREE?.[userRole]
    const pathname = usePathname();

    if (!items) return null; // 👈 Avoid rendering if no data

    return (
        <div className={classes.container}>
            <Link href={'/'} className={classes.logo}>S O U N D M A C</Link>

            <div className={classes.navContainer}>
                {
                    Object.keys(items)?.map((i, index) => (
                        <div key={index} className={classes.titleContainer}>
                            <p className={classes.title}>{i}</p>
                            <div className={classes.subTitleContainer}>
                                {items[i]?.map((s, idx) => (
                                    <Link href={s?.link} className={`${classes.subTitle} ${s?.link === pathname ? classes.active : ""}`} key={idx}>{s?.name}</Link>
                                ))}
                            </div>
                        </div>
                    ))
                }
            </div>

            <div className={classes.parentProfileCon}>
                <div className={classes.profileDropDownCon}>
                    {
                        profileDropDown.map((p, index) => (
                            <button className={classes.profileDropdownBtn} key={index}>{p.name}</button>
                        ))
                    }
                    <button className={`${classes.profileDropdownBtn} ${classes.logOutBtn}`}>Log out</button>
                </div>

                <div className={classes.profileCon}>
                    <div className={classes.profileNameCon}>
                        <p className={classes.profileName}>{userContext?.user?.first_name} {userContext?.user?.last_name}</p>
                        <p className={classes.profileType}>{userContext?.user?.type.replaceAll('_', " ").toLowerCase()}</p>
                    </div>
                    <ArrowIcon />
                </div>
            </div>
        </div>
    )
}