

export interface PricingObjects{
    popular: boolean
    bigBox: boolean
    title: string;
    subTitle: string;
    price: string;
    prompt: string;
    features: string[]
    plan:string
}

export const planColors = [
  { bg: '#E8E8E8', text: '#333333' }, // Index 0 (Emerging Artist)
  { bg: '#E7ECF0', text: '#103958' }, // Index 1 (Independent Artist)
  { bg: '#F0F0E7', text: '#585810' }, // Index 2 (Indie Label)
  { bg: '#FCF1EA', text: '#DD7230' }, // Index 3 (Major Label)
  { bg: '#EAF5EB', text: '#2B9E36' }, // Index 4 (API & White Label)
];