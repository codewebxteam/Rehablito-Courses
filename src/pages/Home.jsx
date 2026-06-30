import React from "react";
import Hero from "../components/Hero";
import MarqueeSection from "../components/MarqueeSection";
import CardsSwap from "../components/CardsSwap";
import DigitalProducts from "../components/DigitalProducts";
import RoadmapSection from "../components/RoadmapSection";
import FAQSection from "../components/FAQSection";

const Home = () => {
  return (
    <main className="w-full overflow-x-hidden bg-slate-50">
      {/* Section 1: Hero (Full Screen) */}
      <section className="relative w-full">
        <Hero />
      </section>

      {/* Section 2: Marquee (Strip) */}
      <section className="w-full">
        <MarqueeSection />
      </section>

      {/* Section 3: Syllabus/Cards (Academy Tracks) */}
      {/* [FIXED] Added 'pb-24 lg:pb-0' to fix mobile cut-off & gap issue */}
      <section className="w-full relative z-10 pb-24 lg:pb-0">
        <CardsSwap />
      </section>

      {/* Section 4: Featured Courses */}
      <section className="w-full">
        <DigitalProducts />
      </section>

      {/* Section 5: Roadmap (How it works) */}
      <section className="w-full">
        <RoadmapSection />
      </section>

      {/* Section 6: FAQs */}
      <section className="w-full">
        <FAQSection />
      </section>
    </main>
  );
};

export default Home;