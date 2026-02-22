"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How long does it take for my release to go live?",
    answer:
      "Most releases go live within 3–5 business days after submission and approval. However, it can take up to 10 business days for stores like Apple Music or Spotify to fully index your release. We recommend submitting at least two weeks before your intended release date.",
    tag: "⏱ Typically 3–5 days",
  },
  {
    question: "Why was my release rejected?",
    answer: null,
    bullets: [
      "Artwork doesn't meet store guidelines (e.g. contains URLs or explicit imagery without an advisory)",
      "Metadata mismatches — artist name differs between tracks",
      "Audio quality below the required 16-bit / 44.1 kHz standard",
      "Copyright conflicts or uncleared samples",
    ],
    footer: "Check your email for a detailed rejection reason or visit your Release Dashboard.",
  },
  {
    question: "How do I add collaborators to a song?",
    answer:
      "When creating or editing a release, navigate to Track Details and select Add Collaborator. Enter their Soundmac username or email — they'll receive an invite and must accept before their name appears across stores. You can assign roles like Featured Artist, Songwriter, Producer, or Remixer, and configure revenue splits from the Royalty Split panel.",
  },
  {
    question: "How do I change my subscription plan?",
    answer:
      "Go to Account → Billing & Plans and click Change Plan. Upgrades take effect immediately, while downgrades apply at the end of your current billing cycle. If you're on an annual plan, a prorated credit will be applied toward your new plan.",
    tag: "💳 No cancellation fees",
  },
  {
    question: "When and how do I get paid?",
    answer:
      "Royalties are collected monthly with a 60–90 day delay from when streams occur to when funds appear in your Soundmac wallet. Once your balance exceeds $10, you can request a payout via PayPal, bank transfer, or Stripe — processed within 3–5 business days.",
    tag: "💰 Minimum payout: $10",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <span
      className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300
        ${open
          ? "bg-primary-500 border-primary-500 rotate-180"
          : "bg-gray-50 border-gray-200"
        }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 9L12 15L18 9"
          stroke={open ? "#fff" : "#8888a0"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function FAQItem({
  faq,
  isOpen,
  onToggle,
  index,
}: {
  faq: (typeof faqs)[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden shadow-sm transition-all duration-300
        ${isOpen ? "border-primary-500 shadow-primary-500 shadow-md" : "border-gray-100"}`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left"
      >
        <span
          className={`text-[0.95rem] font-medium leading-snug transition-colors duration-200
            ${isOpen ? "text-primary-500" : "text-gray-800"}`}
        >
          {faq.question}
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {/* Animated body using max-height */}
      <div
        className={`grid transition-all duration-300 ease-in-out
          ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-4 border-t border-gray-100 space-y-3">
            {faq.answer && (
              <p className="text-[0.875rem] text-gray-500 leading-relaxed">
                {faq.answer}
              </p>
            )}
            {faq.bullets && (
              <ul className="space-y-1.5 text-[0.875rem] text-gray-500 leading-relaxed list-disc list-inside">
                {faq.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
            {faq.footer && (
              <p className="text-[0.875rem] text-gray-500 leading-relaxed">
                {faq.footer}
              </p>
            )}
            {faq.tag && (
              <span className="inline-block mt-1 bg-primary-500 text-white text-[0.75rem] font-semibold px-3 py-1 rounded-full tracking-wide">
                {faq.tag}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="min-h-screen flex justify-center items-start">
      <div className="w-full md:max-w-[500px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-normal tracking-tight text-gray-900">
            FAQs
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-light">
            Everything you need to know about releasing on Soundmac.
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-2.5 border2 border-neutral-100">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              index={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}