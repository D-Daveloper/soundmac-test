"use client";
import { useContext, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import classes from "./page.module.css";
import sippingGuy from "../../assets/images/sipingGuy.png";
import Image from "next/image";
import axios, { AxiosError } from "axios";
// import { SERVER } from '../constant';
import Loader from "../components/Loader/loader";
// import OTP_MODAL from '../components/OTPModal/OTPModal';
import { ERROR_PROPS } from "../type";
// import { linkRoutes } from '../utils/constants';
// import { useSearchParams } from "next/navigation";
import InformationContext from "../context/informationContext/informationContext";

export default function SignIn() {
  const informationContext = useContext(InformationContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    country: "",
    email: "",
    password: "",
    referral: "",
  });

  const selectOption = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
    const body = JSON.stringify(formData);
    setLoading(true);
    try {
      const response = await axios.post(`/api/auth/register`, body, config);
      const { data } = response;
      const message = data.msg;
      informationContext?.addToast("success", "Success!", message);

    } catch (err) {
      const error = err as AxiosError<ERROR_PROPS>;
      const message = error?.response?.data?.msg || "unexpected error";
      const validationErrs = error?.response?.data?.validationErrs;
      if (validationErrs) {
        validationErrs.forEach((err) => {
          informationContext?.addToast("error", "Error!", err);
        });
        return;
      }

      informationContext?.addToast("error", "Error!", message);
    } finally {
      setLoading(false);
    }
  };


  const handleSendVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(formData);
    setLoading(true);
    try {
      const response = await axios.patch(`/api/auth/register`, body, config);
      const { data } = response;
      const message = data.msg;
      informationContext?.addToast("success", "Success!", message);

    } catch (err) {
      const error = err as AxiosError<ERROR_PROPS>;
      const message = error?.response?.data?.msg || "unexpected error";
      informationContext?.addToast("error", "Error!", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <Image
        src={sippingGuy}
        alt="a guy sipping juice"
        className={classes.sippingGuy}
      />
      <form className={classes.form} onSubmit={handleSubmit}>
        <p className={classes.intro}>Create your Soundmac Account</p>
        <p className={classes.description}>
          Tell us about yourself to get started.
        </p>

        <div className={classes.inputGroup}>
          <div className="flex gap-2">
            <input
              type="text"
              name="first_name"
              placeholder="First name"
              value={formData.first_name}
              onChange={selectOption}
              className={classes.input}
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last name"
              value={formData.last_name}
              onChange={selectOption}
              className={classes.input}
              required
            />
          </div>
        </div>
        <div className={classes.inputGroup}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={selectOption}
            className={classes.input}
            required
          />
        </div>
        <div className={classes.inputGroup}>
          <div className="flex gap-2">
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={selectOption}
              className={classes.input}
              required
            />
            <input
              type="text"
              name="referral"
              placeholder="Referral code"
              value={formData.referral}
              onChange={selectOption}
              className={classes.input}
            />
          </div>
        </div>

        <div className={classes.inputGroup}>
          <div className={classes.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={selectOption}
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

        <button
          onClick={(e)=>{
            handleSendVerify(e)
          }}
          disabled={loading}
          type="button"
          className="underline text-[#5a9fd4] mb-4 hover:cursor-pointer max-sm:text-[6px] verifyLink"
        >
          {loading ? (
            <Loader color={null} />
          ) : (
            "Didn't receive the verification link?"
          )}
        </button>

        <button
          disabled={loading}
          type="submit"
          className={classes.signInButton}
        >
          {loading ? <Loader color={null} /> : "Sign up"}
        </button>

        <div className={classes.divider}>
          <span>or</span>
        </div>

        <a
          href="/signIn"
          className={
            classes.registerButton + "  flex items-center justify-center"
          }
        >
          Sign in
        </a>
      </form>
    </div>
  );
}