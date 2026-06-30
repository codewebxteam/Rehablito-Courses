import React, { useState, useEffect } from "react";
import { Search, BookOpen, Clock, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCourse } from "../../context/CourseContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { motion, AnimatePresence } from "framer-motion";

const ExploreCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // [REMOVED] Filter state
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

  // [UPDATED] Filter logic only for Search Query
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Explore Courses
          </h1>
          <p className="text-slate-500 text-sm">
            Find your next skill upgrade.
          </p>
        </div>
      </div>

      {/* Search Only (Filter Removed) */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-400 size-5" />
        <input
          type="text"
          placeholder="Search for courses..."
          className="w-full bg-white pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold text-slate-700 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
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
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden mb-4 relative">
                    <img
                      src={course.image || course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src =
                          "https://img.youtube.com/vi/default/maxresdefault.jpg";
                      }}
                    />
                    {isEnrolled(course.id) && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg shadow-lg">
                        Enrolled
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                      {course.category || "General"}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 line-clamp-2 leading-tight">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} /> {course.lectures?.length || 0}{" "}
                        Lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {course.duration || "Self Paced"}
                      </span>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                      <div>
                        {isFree ? (
                          <span className="text-lg font-black text-emerald-600">
                            Free
                          </span>
                        ) : (
                          <div className="flex flex-col">
                            {course.originalPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{course.originalPrice}
                              </span>
                            )}
                            <span className="text-lg font-black text-slate-900">
                              ₹{price}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/courses/${course.id}`}
                        className="size-10 bg-slate-900 rounded-full flex items-center justify-center text-white hover:bg-indigo-600 transition-colors"
                      >
                        <ChevronRight size={20} />
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
