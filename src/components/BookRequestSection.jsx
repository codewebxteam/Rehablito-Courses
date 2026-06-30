import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Send } from "lucide-react";

const BookRequestSection = () => {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 pb-20 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative w-full rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl shadow-slate-900/20"
      >
        {/* --- Background Effects --- */}
        {/* Glowing Gradient Blobs */}
        <div className="absolute top-0 right-0 size-64 bg-[#5edff4]/20 blur-[80px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 size-64 bg-[#0891b2]/20 blur-[80px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-16 gap-10">
          {/* --- Left: Text Content --- */}
          <div className="text-center md:text-left max-w-lg">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[#5edff4] text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
              <Sparkles className="size-3 md:size-3.5 animate-pulse" />
              <span>Community Request</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
              Can't find what you're <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#5edff4] to-[#0891b2]">
                looking for?
              </span>
            </h2>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              We release new e-books every week based on student votes. Tell us
              what topic you want to master next, and we'll write it.
            </p>
          </div>

          {/* --- Right: Interactive Form Card --- */}
          <div className="w-full md:w-auto min-w-75 lg:min-w-100">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl md:rounded-3xl shadow-xl">
              <div className="bg-slate-950/80 rounded-xl md:rounded-2xl p-6 md:p-8 border border-white/5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">
                  Request a Topic
                </label>

                <div className="relative group">
                  <input
                    type="text"
                    placeholder="e.g. Advanced Next.js Patterns"
                    className="w-full bg-slate-900 text-white placeholder:text-slate-600 border border-slate-700 rounded-xl py-4 pl-4 pr-14 focus:outline-none focus:border-[#5edff4] focus:ring-1 focus:ring-[#5edff4] transition-all text-sm md:text-base"
                  />
                  <button className="absolute right-2 top-2 bottom-2 aspect-square bg-[#5edff4] rounded-lg flex items-center justify-center text-slate-900 hover:bg-white hover:scale-105 transition-all cursor-pointer shadow-lg shadow-[#5edff4]/20">
                    <Send className="size-5" />
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="size-8 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden"
                      >
                        <img
                          src={`https://i.pravatar.cc/100?img=${20 + i}`}
                          alt=""
                          className="size-full object-cover opacity-80"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    <span className="text-white font-bold">420+</span> students
                    requested this week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default BookRequestSection;
