import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Rocket,
  Sparkles,
  Brain,
} from "lucide-react";
import { Link } from "react-router-dom";

// --- Step Data ---
const steps = [
  {
    id: 1,
    title: "Join Rehablito",
    description:
      "Enroll in the academy and access premium therapeutic modules and resources.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop",
    fallback: "https://placehold.co/600x400/5edff4/000000?text=Step+1+Therapy",
    stat: "Step 1",
  },
  {
    id: 2,
    title: "Master the Methods",
    description:
      "Learn Applied Behavior Analysis (ABA), Speech Therapy, and Occupational Therapy techniques.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000&auto=format&fit=crop",
    fallback: "https://placehold.co/600x400/5edff4/000000?text=Step+2+Care",
    stat: "Step 2",
  },
  {
    id: 3,
    title: "Practical Application",
    description:
      "Apply learned concepts through case studies, role-play, and observed therapy sessions.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000&auto=format&fit=crop",
    fallback: "https://placehold.co/600x400/5edff4/000000?text=Step+3+Application",
    stat: "Step 3",
  },
  {
    id: 4,
    title: "Begin Your Clinical Journey",
    description:
      "Showcase your expertise and begin making a real difference in the lives of children and families.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop",
    fallback: "https://placehold.co/600x400/5edff4/000000?text=Step+4+Career",
    stat: "Goal",
  },
];

const RoadmapSection = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="w-full relative font-sans bg-white py-20 px-4 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* --- Main Container --- */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-6xl mx-auto bg-white rounded-[2.5rem] p-6 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 relative z-10"
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* --- LEFT SIDE: Content --- */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 w-fit mb-4">
                <Sparkles className="size-3 text-[#0891b2]" />
                <span className="text-xs font-bold text-[#0891b2] tracking-wide uppercase">
                  Care Pathway
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                Your Roadmap to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0891b2] to-[#5edff4]">
                  Creative Freedom
                </span>
              </h2>
              <p className="mt-4 text-base md:text-lg text-slate-500 leading-relaxed font-medium">
                From foundation to advanced practitioner. Master clinical care,
                autism therapy, and developmental support in 4 simple steps.
              </p>
            </motion.div>

            {/* Steps List */}
            <div className="flex flex-col gap-3 mt-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`group relative flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 border cursor-pointer outline-none
                  ${
                    activeStep === step.id
                      ? "bg-slate-900 border-slate-900 shadow-xl scale-[1.02]"
                      : "bg-white border-slate-100 hover:border-sky-200 hover:bg-sky-50"
                  }`}
                >
                  {/* Number Badge */}
                  <div
                    className={`size-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-black transition-colors
                    ${
                      activeStep === step.id
                        ? "bg-[#5edff4] text-slate-900"
                        : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-sky-500"
                    }`}
                  >
                    0{step.id}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <span
                      className={`text-lg font-bold block transition-colors ${
                        activeStep === step.id
                          ? "text-white"
                          : "text-slate-700 group-hover:text-slate-900"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {/* Arrow Icon */}
                  <ArrowRight
                    className={`size-5 transition-all ${
                      activeStep === step.id
                        ? "text-[#5edff4] opacity-100 translate-x-0"
                        : "text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* --- RIGHT SIDE: Image Display --- */}
          <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center order-1 lg:order-2">
            {/* Main Image Frame */}
            <div className="relative size-full rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900 border-4 border-white ring-1 ring-slate-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="size-full"
                >
                  <img
                    src={steps[activeStep - 1].image}
                    alt={steps[activeStep - 1].title}
                    className="size-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = steps[activeStep - 1].fallback;
                    }}
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80" />
                </motion.div>
              </AnimatePresence>

              {/* Text Overlay on Image */}
              <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                <motion.div
                  key={`content-${activeStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#5edff4] text-slate-900 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">
                      {steps[activeStep - 1].stat}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                    {steps[activeStep - 1].title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                    {steps[activeStep - 1].description}
                  </p>
                </motion.div>
              </div>

              {/* Care Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="size-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                  <div className="text-center">
                    <CheckCircle2 className="size-8 text-[#5edff4] mx-auto mb-1" />
                    <span className="text-white font-black text-xs tracking-widest">
                      CARE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden md:flex items-center gap-3 animate-bounce-slow"
            >
              <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">
                  Status
                </p>
                <p className="text-sm text-slate-900 font-bold">
                  Admission Open
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- Bottom CTA --- */}
        <div className="mt-12 flex justify-center">
          <Link to="/courses">
            <button className="group relative px-8 py-4 bg-slate-900 rounded-full text-white font-bold text-lg shadow-2xl hover:shadow-sky-500/20 hover:-translate-y-1 transition-all active:scale-95 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Launch Your Career{" "}
                <Sparkles className="size-5 text-[#5edff4] group-hover:rotate-12 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default RoadmapSection;
