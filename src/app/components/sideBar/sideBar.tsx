import Link from 'next/link'
import classes from './sideBar.module.css'
import UserContext from '@/app/context/userContext/userContext';
import { useContext } from 'react';
import { LOCATION_TREE } from '@/app/utils/constants';

export default function SideBar() {
    const userContext = useContext(UserContext)
    const userRole = userContext?.user?.role || ""
    const items = LOCATION_TREE?.[userRole]

    if (!items) return null; // 👈 Avoid rendering if no data
    
    return (
        <div className={classes.container}>
            <Link href={'/'} className={classes.logo}>S O U N D M A C</Link>
            {
                Object.keys(items)?.map((i, index) => (
                    <div key={index}>
                        <p>{i}</p>
                    </div>
                ))
            }
        </div>
    )
}