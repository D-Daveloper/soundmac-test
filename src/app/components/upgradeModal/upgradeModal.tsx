'use client'
import InformationContext from "@/app/context/informationContext/informationContext";
import { useContext } from "react";
import classes from './upgradeModal.module.css'
import { MdClose } from "react-icons/md";
import { ArrowBigUp } from "lucide-react";



export default function UpgradeModal() {
    const informationContext = useContext(InformationContext)

    if (!informationContext?.upgrades || !informationContext?.upgrades?.length) {
        return null
    }

    const onClose = () => {
        informationContext?.discourageUpgrade()
    }

    return (
        <div className={classes["upgrade-overlay"]}>
            <div className={classes["upgrade-modal"]}>
                <button className={classes["close-btn"]} onClick={onClose} aria-label="Close">
                    <MdClose className={classes.closeIcon} />
                </button>

                <div className={classes["modal-content"]}>
                    <div className={classes["icon-container"]}>
                        <div className={classes["phone-icon"]}>
                            <ArrowBigUp className={classes.upgradeIcon} />
                        </div>
                    </div>

                    <h2 className={classes["modal-title"]}>Upgrade Your Account</h2>
                    <p className={classes["modal-description"]}>
                        To continue with this action you need to upgrade your subscription
                    </p>

                    <div className={classes.groupedBtn}>
                        {
                            informationContext?.upgrades?.map((u, index) => (
                                <button
                                    key={index}
                                    className={classes["subscribe-btn"]}
                                // onClick={() => handleVerify(otp.join(''))}
                                // disabled={otp.some(digit => !digit) || isLoading}
                                >
                                    Subscribe to {u.replaceAll('_', ' ').toLowerCase()}
                                </button>
                            ))
                        }
                    </div>


                </div>
            </div>
        </div>
    )
}