import React from "react";
import Hero from "../components/Hero";
import ExploreCourses from "../components/ExploreCourses";
import WhyChooseAndReviews from "../components/WhyChooseAndReviews";
import StatsAndNewsletter from "../components/StatsAndNewsletter";

const Home = () => {
  return (
    <main className="w-full overflow-x-hidden bg-slate-50">
      {/* Section 1: Hero (Full Screen) */}
      <section className="relative w-full">
        <Hero />
      </section>

      {/* Section 2: Explore Our Online Courses */}
      <section className="w-full">
        <ExploreCourses />
      </section>

      {/* Section 3: Why Choose Rehablito & What Parents Say Reviews */}
      <section className="w-full">
        <WhyChooseAndReviews />
      </section>

      {/* Section 4: Stats Counter & WhatsApp Stay Updated Banner */}
      <section className="w-full">
        <StatsAndNewsletter />
      </section>
    </main>
  );
};

export default Home;