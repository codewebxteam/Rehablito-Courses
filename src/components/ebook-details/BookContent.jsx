import React from "react";
import { FileText } from "lucide-react";

const BookContent = ({ chapters }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xl font-bold text-slate-900">Table of Contents</h3>
        <p className="text-sm text-slate-500 mt-1">
          {chapters.length} Chapters
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {chapters.map((chapter, idx) => (
          <div
            key={idx}
            className="p-5 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="text-slate-400 text-sm font-mono">
                  {(idx + 1).toString().padStart(2, "0")}.
                </span>
                {chapter.title}
              </h4>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                pp. {chapter.pages}
              </span>
            </div>
            <div className="pl-8 flex flex-wrap gap-2">
              {chapter.topics.map((topic, i) => (
                <span
                  key={i}
                  className="text-xs text-slate-500 flex items-center gap-1"
                >
                  <span className="size-1 bg-[#5edff4] rounded-full" /> {topic}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default BookContent;
