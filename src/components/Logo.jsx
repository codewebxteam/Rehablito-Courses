import React from "react";

const Logo = () => {
  return (
    // Container: Neon Gradient Box with Shadow
    <div className="size-10 bg-linear-to-br from-[#5edff4] to-[#0891b2] rounded-xl flex items-center justify-center shadow-lg shadow-[#5edff4]/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
      {/* Brand Mark 'A' */}
      <span className="text-slate-900 font-bold text-xl leading-none">A</span>
    </div>
  );
};

export default Logo;
