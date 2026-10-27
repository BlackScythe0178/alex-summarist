"use client";

import { useEffect, useState } from "react";
import { AiFillAudio, AiFillBulb, AiFillFileText } from "react-icons/ai";

const firstHeadings = [
  "Enhance your knowledge",
  "Achieve greater success",
  "Improve your health",
  "Develop better parenting skills",
  "Increase happiness",
  "Be the best version of yourself!",
];

const secondHeadings = [
  "Expand your learning",
  "Accomplish your goals",
  "Strengthen your vitality",
  "Become a better caregiver",
  "Improve your mood",
  "Maximize your abilities",
];

/** Cycles the green "active" heading every 2 seconds, like the reference site. */
function useActiveIndex(length: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % length), 2000);
    return () => clearInterval(id);
  }, [length]);
  return index;
}

export default function Features() {
  const active = useActiveIndex(firstHeadings.length);

  return (
    <section id="features">
      <div className="container">
        <div className="row">
          <div className="section__title">Understand books in few minutes</div>
          <div className="features__wrapper">
            <div className="features">
              <div className="features__icon">
                <AiFillFileText />
              </div>
              <div className="features__title">Read or listen</div>
              <div className="features__sub--title">
                Save time by getting the core ideas from the best books.
              </div>
            </div>
            <div className="features">
              <div className="features__icon">
                <AiFillBulb />
              </div>
              <div className="features__title">Find your next read</div>
              <div className="features__sub--title">
                Explore book lists and personalized recommendations.
              </div>
            </div>
            <div className="features">
              <div className="features__icon">
                <AiFillAudio />
              </div>
              <div className="features__title">Briefcasts</div>
              <div className="features__sub--title">Gain valuable insights from briefcasts</div>
            </div>
          </div>

          <div className="statistics__wrapper">
            <div className="statistics__content--header">
              {firstHeadings.map((h, i) => (
                <div
                  key={h}
                  className={`statistics__heading ${i === active ? "statistics__heading--active" : ""}`}
                >
                  {h}
                </div>
              ))}
            </div>
            <div className="statistics__content--details">
              <div className="statistics__data">
                <div className="statistics__data--number">93%</div>
                <div className="statistics__data--title">
                  of Summarist members <b>significantly increase</b> reading frequency.
                </div>
              </div>
              <div className="statistics__data">
                <div className="statistics__data--number">96%</div>
                <div className="statistics__data--title">
                  of Summarist members <b>establish better</b> habits.
                </div>
              </div>
              <div className="statistics__data">
                <div className="statistics__data--number">90%</div>
                <div className="statistics__data--title">
                  have made <b>significant positive</b> change to their lives.
                </div>
              </div>
            </div>
          </div>

          <div className="statistics__wrapper">
            <div className="statistics__content--details statistics__content--details-second">
              <div className="statistics__data">
                <div className="statistics__data--number">91%</div>
                <div className="statistics__data--title">
                  of Summarist members <b>report feeling more productive</b> after incorporating the
                  service into their daily routine.
                </div>
              </div>
              <div className="statistics__data">
                <div className="statistics__data--number">94%</div>
                <div className="statistics__data--title">
                  of Summarist members have <b>noticed an improvement</b> in their overall
                  comprehension and retention of information.
                </div>
              </div>
              <div className="statistics__data">
                <div className="statistics__data--number">88%</div>
                <div className="statistics__data--title">
                  of Summarist members <b>feel more informed</b> about current events and industry
                  trends since using the platform.
                </div>
              </div>
            </div>
            <div className="statistics__content--header statistics__content--header-second">
              {secondHeadings.map((h, i) => (
                <div
                  key={h}
                  className={`statistics__heading ${i === active ? "statistics__heading--active" : ""}`}
                >
                  {h}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
