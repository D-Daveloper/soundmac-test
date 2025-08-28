'use client'
import Link from 'next/link'
import classes from './sideBar.module.css'
import UserContext from '@/app/context/userContext/userContext';
import { useContext, useEffect, useState } from 'react';
import { linkRoutes, LOCATION_TREE } from '@/app/utils/constants';
import { usePathname, useRouter } from 'next/navigation';
import { profileDropDown } from './constant';
import { NormalLoadingScreen } from '../Loader/loader';
import { USER } from '@/app/context/userContext/types';

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
  const userContext = useContext(UserContext);
  const getUser = userContext?.getUser;
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const [userRole, setUserRole] = useState(userContext?.user?.role || "");
  const [items, setItems] = useState(LOCATION_TREE?.[userRole] || null);

    const onSuccess = (user: USER) => {
        console.log(user)
        const userRole: string = user?.role;
        const location = linkRoutes.artists[userRole]
        router.push(location)
    }

    const onError = (error: unknown) => {
        userContext?.handleAPIError(error)
    }
  useEffect(() => {
      if (!items && getUser) {
        getUser(setLoading, onSuccess, onError);
      }
    // Update role + items whenever context changes
    const newRole = userContext?.user?.role || "";
    setUserRole(newRole);
    setItems(LOCATION_TREE?.[newRole] || null);
  }, [getUser, userContext]);

  if (loading || !items) return <NormalLoadingScreen />;

  return (
    <div className={classes.container}>
      <Link href={"/"} className={classes.logo}>
        S O U N D M A C
      </Link>

      <div className={classes.navContainer}>
        {Object.keys(items)?.map((i, index) => (
          <div key={index} className={classes.titleContainer}>
            <p className={classes.title}>{i}</p>
            <div className={classes.subTitleContainer}>
              {items[i]?.map((s, idx) => (
                <Link
                  href={s?.link}
                  className={`${classes.subTitle} ${
                    s?.link === pathname ? classes.active : ""
                  }`}
                  key={idx}
                >
                  {s?.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={classes.parentProfileCon}>
        <div className={classes.profileDropDownCon}>
          {profileDropDown.map((p, index) => (
            <button className={classes.profileDropdownBtn} key={index}>
              {p.name}
            </button>
          ))}
          <button
            className={`${classes.profileDropdownBtn} ${classes.logOutBtn}`}
          >
            Log out
          </button>
        </div>

        <div className={classes.profileCon}>
          <div className={classes.profileNameCon}>
            <p className={classes.profileName}>
              {userContext?.user?.first_name} {userContext?.user?.last_name}
            </p>
            {/* <p className={classes.profileType}>{userContext?.user?.type.replaceAll('_', " ").toLowerCase()}</p> */}
          </div>
          <ArrowIcon />
        </div>
      </div>
    </div>
  );
}