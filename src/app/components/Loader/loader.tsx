
'use client'
import { useEffect, useState } from 'react';
import classes from './loader.module.css'
import { LOADER } from './types'
import Image from 'next/image';
import logo from '../../../assets/images/soundmacsLogo.png'

export default function Loader(params: LOADER) {
    return (
        <div style={params?.color ? { borderRightColor: params.color } : {}} className={classes.loader}></div>
    )
}


export function LoadingScreen() {
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoading(false);
        }, 2000); // Reduced from 200000000 to 2000ms (2 seconds)

        return () => clearTimeout(timer);
    }, []);

    if (!showLoading) return null;

    return (
        <div className={classes.loadingOverlay}>
            <div className={classes.logoContainer}>
                <Image
                    src={logo}
                    alt="Soundmac's Logo"
                    className={classes.logo}
                    width={200}
                    height={200}
                />
            </div>

        </div>
    )
} 



export function NormalLoadingScreen() {
    return (
        <div className={classes.loadingOverlay}>
            <div className={classes.logoContainer}>
                <Image
                    src={logo}
                    alt="Soundmac's Logo"
                    className={classes.logo}
                    width={200}
                    height={200}
                />
            </div>
        </div>
    )
} 