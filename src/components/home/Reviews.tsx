"use client";

import { BsStarFill } from "react-icons/bs";
import { useHomeLogin } from "@/hooks/useHomeLogin";

const reviews = [
  {
    name: "Hanna M.",
    body: (
      <>
        This app has been a <b>game-changer</b> for me! It&apos;s saved me so much time and effort in
        reading and comprehending books. Highly recommend it to all book lovers.
      </>
    ),
  },
  {
    name: "David B.",
    body: (
      <>
        I love this app! It provides <b>concise and accurate summaries</b> of books in a way that is
        easy to understand. It&apos;s also very user-friendly and intuitive.
      </>
    ),
  },
  {
    name: "Nathan S.",
    body: (
      <>
        This app is a great way to get the main takeaways from a book without having to read the
        entire thing. <b>The summaries are well-written and informative.</b> Definitely worth
        downloading.
      </>
    ),
  },
  {
    name: "Ryan R.",
    body: (
      <>
        If you&apos;re a busy person who <b>loves reading but doesn&apos;t have the time</b> to read
        every book in full, this app is for you! The summaries are thorough and provide a great
        overview of the book&apos;s content.
      </>
    ),
  },
];

function Stars() {
  return (
    <div className="review__stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <BsStarFill key={i} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const handleLogin = useHomeLogin();
  return (
    <section id="reviews">
      <div className="row">
        <div className="container">
          <div className="section__title">What our members say</div>
          <div className="reviews__wrapper">
            {reviews.map((r) => (
              <div className="review" key={r.name}>
                <div className="review__header">
                  <div className="review__name">{r.name}</div>
                  <Stars />
                </div>
                <div className="review__body">{r.body}</div>
              </div>
            ))}
          </div>
          <div className="reviews__btn--wrapper">
            <button className="btn home__cta--btn" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
