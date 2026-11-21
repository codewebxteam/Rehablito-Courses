import React from "react";
import rehablitoLogo from "../assets/rehablito-logo.png";

const Logo = ({ className = "h-10 w-auto" }) => {
  return (
    <div className="flex items-center">
      <img
        src={rehablitoLogo}
        alt="Rehablito Courses"
        className={`${className} object-contain`}
      />
    </div>
  );
};

export default Logo;
