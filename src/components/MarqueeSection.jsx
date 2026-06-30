import React from "react";
import Marquee from "react-fast-marquee";
import { Sparkles } from "lucide-react";

const MarqueeSection = () => {
  const items = [
    "ABA THERAPY",
    "SPEECH THERAPY",
    "OCCUPATIONAL THERAPY",
    "PHYSIOTHERAPY",
    "REHABLITO ACADEMY",
  ];

  return (
    // [UPDATED] Background White, Borders subtle grey
    <section className="relative w-full bg-white py-3 overflow-hidden border-y border-slate-100">
      {/* [UPDATED] Side Fade: White gradient to blend with background */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <Marquee speed={50} gradient={false} className="flex items-center">
        {[1, 2, 3, 4, 5].map((iter) => (
          <div key={iter} className="flex items-center shrink-0">
            {items.map((text, index) => {
              const isBrand = text === "REHABLITO ACADEMY";

              return (
                <React.Fragment key={index}>
                  {/* Icon: Slate-300 (Light Grey) for subtle separation */}
                  <Sparkles
                    className={`mx-6 size-3 md:size-4 ${isBrand ? "text-[#5edff4]" : "text-slate-300"} opacity-100`}
                  />

                  {/* [UPDATED] Text: Slate-800 (Soft Black/Dark Grey) */}
                  <span
                    className={`
                      font-bold tracking-[0.2em] uppercase select-none
                      text-sm md:text-base
                      ${isBrand ? "text-slate-900" : "text-slate-700"}
                    `}
                  >
                    {text}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </Marquee>
    </section>
  );
};

export default MarqueeSection;
