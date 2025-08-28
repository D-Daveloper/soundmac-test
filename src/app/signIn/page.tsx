'use client'
import { useContext, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import classes from './page.module.css'
import sippingGuy from '../../assets/images/sipingGuy.png'
import Image from 'next/image'
import axios, { AxiosError } from 'axios';
import { SERVER } from '../constant';
import Loader from '../components/Loader/loader';
import OTP_MODAL from '../components/OTPModal/OTPModal';
import { ERROR_PROPS } from '../type';
import { linkRoutes } from '../utils/constants';
import { useRouter, useSearchParams } from 'next/navigation';
import InformationContext from '../context/informationContext/informationContext';
import UserContext from '../context/userContext/userContext';
import Link from 'next/link';

export default function SignIn() {
    const informationContext = useContext(InformationContext)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect')
    const safeRedirect = redirect?.startsWith('/') ? redirect : '/user/artists/create-artist'
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userContext = useContext(UserContext)
    const updateUser = userContext?.setUser

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const body = JSON.stringify({ email, password });
        setLoading(true)
        try {
            const response = await axios.post(`${SERVER}/api/auth/login`, body, config);
            const { data } = response
            if (data.otp) {
                setIsModalOpen(true);
                informationContext?.addToast('success', 'Success!', data.msg);
                return;
            }
            localStorage.setItem("token", data.token);
            console.log(data.user);
            if(updateUser){
                updateUser(data.user || null);
            }
            informationContext?.addToast('success', 'Success!', data.msg);
            router.push(safeRedirect)
        } catch (err) {
            const error = err as AxiosError<ERROR_PROPS>;
            const message = error?.response?.data?.msg || "unexpected error";
            // if (message.startsWith(`Please check your mailbox to verify.`)) {
            //     console.log('verify your account')
            //     return;
            // }
            // if (message.startsWith(`An otp has been sent`)) {
            //     setIsModalOpen(true)
            //     return;
            // }

            informationContext?.addToast('error', 'Error!', message);
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

    const handleVerify = (userRole: string) => {
        const location = linkRoutes.artists[userRole]
        setEmail('');
        setPassword('')
        router.push(location)
        setIsModalOpen(false);

    };

    return (
        <div className={classes.container}>
            <OTP_MODAL
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onVerify={handleVerify}
                email={email}
            />
            <Image
                src={sippingGuy}
                alt='a guy sipping juice'
                className={classes.sippingGuy}
            />
            <form className={classes.form} onSubmit={handleSubmit}>
                <p className={classes.intro}>Welcome back, Creator</p>
                <p className={classes.description}>Your ultimate resource for navigating the ever-evolving music industry.</p>

                <div className={classes.inputGroup}>
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={classes.input}
                        required
                    />
                </div>

                <div className={classes.inputGroup}>
                    <div className={classes.passwordWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={classes.input}
                            required
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className={classes.togglePassword}
                        >
                            {showPassword ? (
                                <EyeOff size={20} color="#999" />
                            ) : (
                                <Eye size={20} color="#999" />
                            )}
                        </button>
                    </div>
                </div>

                <button type="button" className={classes.forgotPassword}>
                    Forgot Password?
                </button>

                <button disabled={loading} type="submit" className={classes.signInButton}>
                    {
                        loading ? <Loader color={null} /> :
                            'Sign In'
                    }
                </button>

                <div className={classes.divider}>
                    <span>or</span>
                </div>

                <Link href='/signup' className={classes.registerButton + ("  flex items-center justify-center")}>
                    Create New Account
                </Link>
            </form>
        </div>
    )
}