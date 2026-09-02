import React, { useState, useEffect } from "react";
import { Search, BookOpen, Clock, ChevronRight, Loader2, Sparkles, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { useCourse } from "../../context/CourseContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { motion, AnimatePresence } from "framer-motion";

const ExploreCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { isEnrolled } = useCourse();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courseVideos"));
        const courseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(courseList);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12 font-sans text-[#0F1B3D]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] text-xs font-extrabold mb-2">
            <Compass className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Course Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B3D]">
            Explore <span className="text-[#E6007E]">Programs & Courses</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Discover expert-led speech therapy, autism, and child development modules.
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-[#0F1B3D]" />
        <input
          type="text"
          placeholder="Search for courses by title or category..."
          className="w-full bg-white pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#0F1B3D] font-semibold text-xs sm:text-sm text-[#0F1B3D] shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#E6007E] w-10 h-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCourses.map((course, index) => {
              const price = Number(course.price) || 0;
              const isFree = price === 0;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-[#071838] rounded-2xl overflow-hidden mb-4 relative">
                    <img
                      src={course.image || course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60";
                      }}
                    />
                    {isEnrolled(course.id) && (
                      <div className="absolute top-3 right-3 bg-[#16A34A] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">
                        Enrolled
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="inline-block text-[10px] font-extrabold text-[#E6007E] bg-[#FCE7F3] px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                        {course.category || "General"}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-[#0F1B3D] line-clamp-2 leading-snug group-hover:text-[#E6007E] transition-colors">
                        {course.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#0284C7]" /> {course.lectures?.length || 0} Lessons
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#EA580C]" /> {course.duration || "Self Paced"}
                      </span>
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                      <div>
                        {isFree ? (
                          <span className="text-lg font-extrabold text-[#16A34A]">
                            Free
                          </span>
                        ) : (
                          <div className="flex flex-col">
                            {course.originalPrice && (
                              <span className="text-xs text-slate-400 line-through font-semibold">
                                ₹{course.originalPrice}
                              </span>
                            )}
                            <span className="text-lg font-extrabold text-[#0F1B3D]">
                              ₹{price}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/courses/${course.id}`}
                        className="w-10 h-10 bg-[#0F1B3D] rounded-full flex items-center justify-center text-white hover:bg-[#1d2e5e] hover:scale-105 transition-all shadow-md cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ExploreCourses;
