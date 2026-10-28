"use client";
import "./plan.css";

import Image from "next/image";
import { useState } from "react";
import { AiFillFileText } from "react-icons/ai";
import { RiPlantFill } from "react-icons/ri";
import { FaHandshake } from "react-icons/fa";
import { BsChevronDown } from "react-icons/bs";
import Footer from "@/components/Footer";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { openAuthModal } from "@/redux/modalSlice";
import {
  createCheckoutSession,
  PRICE_PREMIUM_MONTHLY,
  PRICE_PREMIUM_PLUS_YEARLY,
} from "@/lib/subscription";

type Billing = "yearly" | "monthly";

const plans: Record<
  Billing,
  { title: string; price: string; text: string; cta: string; disclaimer: string }
> = {
  yearly: {
    title: "Premium Plus Yearly",
    price: "$99.99/year",
    text: "7-day free trial included",
    cta: "Start your free 7-day trial",
    disclaimer: "Cancel your trial at any time before it ends, and you won’t be charged.",
  },
  monthly: {
    title: "Premium Monthly",
    price: "$9.99/month",
    text: "No trial included",
    cta: "Start your first month",
    disclaimer: "30-day money back guarantee, no questions asked.",
  },
};

const faqs = [
  {
    q: "How does the free 7-day trial work?",
    a: "Start your free trial and enjoy every Premium feature for 7 days. If you cancel before the trial ends, you won’t be charged. If you keep it, your yearly subscription begins automatically when the trial finishes. We’ll remind you before the trial is over so there are no surprises.",
  },
  {
    q: "Can I switch subscriptions from monthly to yearly, or yearly to monthly?",
    a: "Yes. You can change your plan at any time. Your new plan takes effect at the start of your next billing period, and you keep full access to your current plan until then.",
  },
  {
    q: "What's included in the Premium plan?",
    a: "Premium gives you unlimited access to our full library of book summaries in text and audio, including every title marked Premium, along with personalised recommendations and new summaries added regularly.",
  },
  {
    q: "Can I cancel during my trial or subscription?",
    a: "Absolutely. You can cancel at any time. If you cancel during the free trial you won’t be charged, and if you cancel a paid subscription you keep Premium access until the end of the period you’ve already paid for.",
  },
];

function Accordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="faq__wrapper">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div className="accordion__card" key={f.q}>
            <button
              className="accordion__header"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <div className="accordion__title">{f.q}</div>
              <BsChevronDown className={`accordion__icon ${isOpen ? "accordion__icon--rotate" : ""}`} />
            </button>
            <div className={`collapse ${isOpen ? "show" : ""}`}>
              <div className="collapse__inner">
                <div className="accordion__body">{f.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ChoosePlanPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.user);
  const [billing, setBilling] = useState<Billing>("yearly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setError("");
    if (!user) {
      dispatch(openAuthModal("login"));
      return;
    }
    setLoading(true);
    try {
      const url = await createCheckoutSession(
        billing === "yearly" ? PRICE_PREMIUM_PLUS_YEARLY : PRICE_PREMIUM_MONTHLY
      );
      window.location.assign(url);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  const plan = plans[billing];

  return (
    <div className="plan">
      <div className="plan__header--wrapper">
        <div className="plan__header">
          <div className="plan__title">Get unlimited access to many amazing books to read</div>
          <div className="plan__sub--title">Turn ordinary moments into amazing learning opportunities</div>
          <figure className="plan__img--mask">
            <Image src="/pricing-top.png" alt="pricing" width={860} height={722} preload />
          </figure>
        </div>
      </div>

      <div className="row">
        <div className="container">
          <div className="plan__features--wrapper">
            <div className="plan__features">
              <figure className="plan__features--icon">
                <AiFillFileText />
              </figure>
              <div className="plan__features--text">
                <b>Key ideas in few min</b> with many books to read
              </div>
            </div>
            <div className="plan__features">
              <figure className="plan__features--icon">
                <RiPlantFill />
              </figure>
              <div className="plan__features--text">
                <b>3 million</b> people growing with Summarist everyday
              </div>
            </div>
            <div className="plan__features">
              <figure className="plan__features--icon plan__features--icon-handshake">
                <FaHandshake />
              </figure>
              <div className="plan__features--text">
                <b>Precise recommendations</b> collections curated by experts
              </div>
            </div>
          </div>

          <div className="section__title">Choose the plan that fits you</div>

          {(["yearly", "monthly"] as Billing[]).map((b, i) => (
            <div key={b}>
              {i === 1 && (
                <div className="plan__card--separator">
                  <div className="plan__separator">or</div>
                </div>
              )}
              <div
                className={`plan__card ${billing === b ? "plan__card--active" : ""}`}
                role="radio"
                aria-checked={billing === b}
                tabIndex={0}
                onClick={() => setBilling(b)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setBilling(b)}
              >
                <div className="plan__card--circle">
                  {billing === b && <div className="plan__card--dot" />}
                </div>
                <div className="plan__card--content">
                  <div className="plan__card--title">{plans[b].title}</div>
                  <div className="plan__card--price">{plans[b].price}</div>
                  <div className="plan__card--text">{plans[b].text}</div>
                </div>
              </div>
            </div>
          ))}

          <div className="plan__card--cta">
            <span className="btn--wrapper">
              <button className="btn plan__cta--btn" onClick={handleCheckout} disabled={loading}>
                {loading ? <span className="spinner spinner--dark" /> : plan.cta}
              </button>
            </span>
            {error && <div className="plan__error">{error}</div>}
            <div className="plan__disclaimer">{plan.disclaimer}</div>
          </div>

          <Accordion />
        </div>
      </div>
      <Footer />
    </div>
  );
}
