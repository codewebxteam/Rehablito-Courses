import React from "react";
import { Star, BookOpen, Calendar } from "lucide-react";

const BookHero = ({ book }) => {
  return (
    // FIX APPLIED: Matches CourseHero.jsx exact classes
    // mt-0 lg:mt-18 pt-12 lg:pt-25 pb-16 px-6
    <div className="bg-slate-900 text-white mt-0 lg:mt-18 pt-12 lg:pt-25 pb-16 px-6 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 p-32 bg-[#5edff4]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 relative z-10">
        <div className="md:col-span-2 space-y-6">
          {/* Breadcrumbs style matching CourseHero */}
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <span className="text-[#5edff4]">{book.category}</span>
            <span>/</span>
            <span>{book.title}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {book.title}
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
            {book.description}
          </p>

          <div className="flex flex-wrap gap-6 text-sm font-medium pt-4 text-slate-400">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="size-4 fill-current" />{" "}
              <span>
                {book.rating} ({book.reviews} reviews)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="size-4" />{" "}
              <span>{book.totalPages} Pages</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />{" "}
              <span>Updated {book.lastUpdated}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
            <div className="size-10 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
              <img
                src={`https://ui-avatars.com/api/?name=${book.author}&background=random`}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-slate-400">Author</p>
              <p className="font-bold text-white">{book.author}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BookHero;
