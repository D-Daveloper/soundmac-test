import { FaRegCheckCircle } from 'react-icons/fa'
import { pricing } from './constants'
import classes from './page.module.css'
import { PricingObjects } from './types'
import { Fragment } from 'react'

export default function Pricing() {
    return (
        <section className={classes.container}>
            <h3 className={classes.h3}>Flexible Plans for Every Business/individual Size</h3>
            <p className={classes.subTitle}>Choose the perfect plan that fits your needs, From individual creators to the biggest enterprises, we have a plan for you.</p>

            <div className={classes.groupedPricingCards}>
                {pricing.map((item, index) => (
                    <PricingCard key={index}
                        {...item}
                    />
                ))}
            </div>
        </section>
    )
}

function PricingCard(props: PricingObjects) {
    return (
        <div className={classes.cardContainer}>
            {props.popular && <p className={classes.popularCap}>Popular</p>}
            <div className={`${classes.smallCard} ${props.bigBox ? classes.bigCard : ''} ${props.popular ? classes.popularCard : ''}`}>
                <h4 style={props.popular ? { color: '#fff' } : {}} className={classes.h4}>{props.title}</h4>
                <p style={props.popular ? { color: '#f5f5f5' } : {}} className={classes.pricingCardSubtitle}>{props.subTitle}</p>
                <h1 style={props.popular ? { color: '#fff' } : {}} className={classes.cardPrice}>{props.price} <span className={classes.cardDuration}>/ yr</span></h1>
                <button className={`${classes.cardPromptBtn}  ${props.popular ? classes.popularPromptBtn : ''} ${props.prompt === 'Contact Us' ? classes.contactUsPromptBtn : ''}`}>{props.prompt}</button>
            </div>
            <div className={`${classes.smallLongCard} ${props.bigBox ? classes.bigLongCard : ''}`}>
                {
                    props.features.map((feature, idx) => (
                        <Fragment key={idx}>
                            <div className={classes.checkAndFeatureGroup}>
                                <div>
                                    <FaRegCheckCircle className={classes.cardCheck} />
                                </div>

                                <p>{feature}</p>
                            </div>
                            {idx !== props.features.length - 1 && <div className={classes.horizontalLine} />}
                        </Fragment>
                    ))
                }
            </div>
        </div>
    )
}