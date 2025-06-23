'use client'
import React, { useState, useRef, useEffect, useContext } from 'react';
import classes from './OTPModal.module.css';
import { MailIcon } from 'lucide-react';
import { MdClose } from 'react-icons/md';
import axios, { AxiosError } from 'axios';
import { SERVER } from '@/app/constant';
import { ERROR_PROPS } from '@/app/type';
import InformationContext from '@/app/context/informationContext';
import Loader from '../Loader/loader';

interface OTPModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (otp: string) => void;
    email?: string;
}

export default function OTP_MODAL({ isOpen, onClose, onVerify, email = "" }: OTPModalProps) {
    const informationContext = useContext(InformationContext)

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resending, setResending] = useState(false);


    useEffect(() => {
        if (isOpen && resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, resendTimer]);

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields are filled
        if (newOtp.every(digit => digit !== '') && index === 5) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (otpValue: string) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        
        const body = JSON.stringify({ otp: otpValue });
        setIsLoading(true);
        setError('');

        try {
            const res = await axios.patch(`${SERVER}/auth/confirmOtp`, body, config);
            const data = res.data;
            localStorage.setItem("token", data.token);
            onVerify(otpValue);
        } catch (err) {
            const error = err as AxiosError<ERROR_PROPS>;
            const message = error.response?.data?.msg || "unexpected error";

            setError(message);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {

        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const body = JSON.stringify({ email });
        setResending(true);
        try {
            const res = await axios.patch(`${SERVER}/auth/resendOtp`, body, config);
            const data = res.data;

            informationContext?.addToast('success', "OTP Re-sent!", data.msg)
            setResendTimer(30);
            setOtp(['', '', '', '', '', '']);
            setError('');
            inputRefs.current[0]?.focus();

        } catch (err) {
            const error = err as AxiosError<ERROR_PROPS>;
            const message = error?.response?.data?.msg || "unexpected error";

            informationContext?.addToast('error',
                'Error!',
                message
            )
        } finally {
            setResending(false);
        }

    };

    if (!isOpen) return null;

    return (
        <div className={classes["otp-overlay"]}>
            <div className={classes["otp-modal"]}>
                <button className={classes["close-btn"]} onClick={onClose} aria-label="Close">
                    <MdClose className={classes.closeIcon} />
                </button>

                <div className={classes["modal-content"]}>
                    <div className={classes["icon-container"]}>
                        <div className={classes["phone-icon"]}>
                            <MailIcon className={classes.mailIcon} />
                        </div>
                    </div>

                    <h2 className={classes["modal-title"]}>Enter Verification Code</h2>
                    <p className={classes["modal-description"]}>
                        We&apos;ve sent a 6-digit code to<br />
                        <strong>{email}</strong>
                    </p>

                    <div className={classes["otp-container"]}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el; }} // no return
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleInputChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(index, e)}
                                className={`${classes["otp-input"]} ${error ? classes["error"] : ""} ${digit ? classes["filled"] : ""}`}
                                disabled={isLoading}
                            />

                        ))}
                    </div>

                    {error && (
                        <div className={classes["error-message"]}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
                                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button
                        className={`${classes["verify-btn"]} ${isLoading ? classes["loading"] : ""}`}
                        onClick={() => handleVerify(otp.join(''))}
                        disabled={otp.some(digit => !digit) || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className={classes["spinner"]}></div>
                                Verifying...
                            </>
                        ) : (
                            'Verify Code'
                        )}
                    </button>

                    <div className={classes["resend-container"]}>
                        {
                            resending ? <Loader color={null} />
                                :
                                <>
                                    {resendTimer > 0 ? (
                                        <p className={classes["resend-timer"]}>
                                            Resend code in <span>{resendTimer}s</span>
                                        </p>
                                    ) : (

                                        <button disabled={resending} className={classes["resend-btn"]} onClick={handleResend}>
                                            Didn&apos;t receive code? <strong>Resend </strong>
                                        </button>
                                    )}
                                </>
                        }

                    </div>
                </div>
            </div>
        </div>

    );
}

