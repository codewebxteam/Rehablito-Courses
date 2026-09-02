import React, { useState } from "react";
import { ChevronDown, PlayCircle, Lock, BookOpen } from "lucide-react";

const Curriculum = ({ syllabus }) => {
  // 1. Handle String Syllabus
  if (typeof syllabus === "string") {
    const lines = syllabus.split("\n").filter((line) => line.trim() !== "");

    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/60">
          <h3 className="text-lg sm:text-xl font-extrabold text-[#0F1B3D]">Course Syllabus & Key Topics</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">Overview of guidance and therapy modules</p>
        </div>
        <div className="p-6">
          {lines.length > 0 ? (
            <ul className="space-y-3">
              {lines.map((line, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-slate-700 text-xs sm:text-sm font-medium leading-relaxed"
                >
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-[#0F1B3D] shrink-0" />
                  <span>{line.replace(/^[•-]\s*/, "")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 italic text-xs">
              No syllabus details available.
            </p>
          )}
        </div>
      </div>
    );
  }

  // 2. Handle Array Syllabus
  if (Array.isArray(syllabus)) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/60">
          <h3 className="text-lg sm:text-xl font-extrabold text-[#0F1B3D]">Course Content</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {syllabus.length} sections •{" "}
            {syllabus.reduce(
              (acc, curr) => acc + (curr.lessons?.length || 0),
              0
            )}{" "}
            lectures
          </p>
        </div>

        <div>
          {syllabus.map((section, idx) => (
            <AccordionSection
              key={idx}
              section={section}
              isOpenDefault={idx === 0}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const AccordionSection = ({ section, isOpenDefault }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={`w-5 h-5 text-[#0F1B3D] transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
          <span className="font-extrabold text-sm sm:text-base text-[#0F1B3D]">{section.title}</span>
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          {section.lessons?.length || 0} lectures
        </span>
      </button>

      {isOpen && (
        <div className="bg-slate-50/80 px-5 pb-4 pt-1 space-y-2">
          {section.lessons?.map((lesson, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 text-xs sm:text-sm pl-8"
            >
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <PlayCircle className="w-4 h-4 text-[#0F1B3D]" />
                <span>{lesson.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-xs">
                  {lesson.time}
                </span>
                <Lock className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Curriculum;
