import { PricingObjects } from "./types";

export const pricing: PricingObjects[] = [
    {
        popular: false, bigBox: false, title: 'Basic', subTitle: 'Perfect for starters with occasional release', price: '$9.99', prompt: 'Get Started',
        features: [
            'Free audio file converter (Upload any audio format)', '2 Songs distribution', 'You keep 85% Royalty', 'Free UPC & ISRC', 'YouTube content ID', 'Payment direct to your bank account', 'Spotify verified artist check mark', 'Apple Music Artist verification', 'Release in within 14 days'
        ]
    },

    {
        popular: true, bigBox: false, title: 'Independent artist', subTitle: 'Ideal for active artists without a record label', price: '$17.99', prompt: 'Get Started',
        features: [
            'Everything in Basic Plan', 'Unlimited distribution', 'Register your music on billboard Chart', 'Keep 100% Royalty', 'Keep 90% YouTube content ID', 'Playlist pitching', 'Release cover song', 'SoundMac Public Profile for artist', 'Smart link request', 'Monthly stream analytics', 'Customizable Release & Pre-order date', 'Promotional opportunity', '1 Video distribution', 'Eligible for Soundmac to invest in your music'
        ]
    },

    {
        popular: false, bigBox: false, title: 'Mini label', subTitle: 'Register for up to 10 multiple artist accounts', price: '$69.99', prompt: 'Get Started',
        features: [
            'Everything in independent artist', 'Unlimited distribution for 10 artists', 'Royalty split', 'Pitch for Tv & movie sync', '5 Video distribution', 'Keep 95% YouTube content ID', 'Cover art creator', 'Expert advice session', 'Release level country Restrictions', 'Advanced insights', 'Invite team members to artist team', 'Customize ITunes pricing'
        ]
    },

    {
        popular: false, bigBox: true, title: 'Full label', subTitle: 'Unlimited multiple artist accounts', price: '$99.99', prompt: 'Get Started',
        features: [
            'Everything in mini label', 'Unlimited distribution for unlimited artists ( label can distribute for up to 1000+ artists)', 'Keep 100% Royalties', 'Keep 100% YouTube content ID', 'Dedicated support team', 'Customizable label name', 'Recording location', 'Access to global marketing', 'RIAA gold & Platinum monitoring', 'Apply for advances', 'SoundExchange + Neighborhood Right', 'Contract template (base on requests)', 'Best license template (Base on request)', 'Customer soundmac - label profile link', 'Billboard chart registration for each artists', 'Billboard chart registration for each artists', 'Radio play promotion', 'Tv station promotion', 'Eligible to be invested to be SoundMac Partner'
        ]
    },


    {
        popular: false, bigBox: true, title: 'API & White Label', subTitle: 'For Music distribution companies, major record labels and music industry giants.', price: 'CUSTOM', prompt: 'Contact Us',
        features: [
            'Everything in full label', 'Anti fraud tools', 'Customer percent deal', 'Users registration', 'Monthly statement and payment', 'All streaming platforms', 'Work as sub-distributor', 'White label', 'API documentation', 'Bulk import / release tool'
        ]
    },
]