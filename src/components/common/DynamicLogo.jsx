import React from "react";
import { Link } from "react-router-dom";
import { useAgency } from "../../context/AgencyContext";

/**
 * DynamicLogo Component
 * Automatically switches between Main Logo and Partner Logo based on context.
 */
const DynamicLogo = ({ className = "h-10" }) => {
  const { agency, loading } = useAgency();

  if (loading)
    return <div className="h-10 w-32 bg-slate-200 animate-pulse rounded" />;

  return (
    <Link to="/" className="flex items-center gap-2 group">
      {/* Logo Image */}
      {agency.logoUrl ? (
        <img
          src={agency.logoUrl}
          alt={`${agency.name} Logo`}
          className={`${className} object-contain transition-transform group-hover:scale-105`}
          onError={(e) => {
            // Fallback agar image load na ho
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
          }}
        />
      ) : null}

      {/* Text Fallback (Hidden by default if logo exists) */}
      <span
        className={`font-bold text-xl tracking-tight hidden ${
          !agency.logoUrl ? "!block" : ""
        }`}
        style={{ color: agency.themeColor }}
      >
        {agency.name}
      </span>
    </Link>
  );
};

export default DynamicLogo;
