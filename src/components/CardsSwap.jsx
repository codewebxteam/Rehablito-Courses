import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { Check, ArrowRight, Zap, Crown, Star, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase/config";

// ==========================================
// SECTION 1: DYNAMIC CARD DESIGNS (WITH THUMBNAILS)
// ==========================================

// Helper for Image Fallback
const getCourseImage = (course) => {
  if (!course) return "https://placehold.co/600x400?text=Rehablito";
  return (
    course.image ||
    course.thumbnail ||
    (course.videoId
      ? `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg`
      : "https://placehold.co/600x400?text=No+Image")
  );
};

// Style 1: White Card (Frontend Style)
const FrontendCard = ({ data }) => {
  const displayPrice = data ? data.price : 2999;
  const imageUrl = getCourseImage(data);
  const info = data
    ? {
        title: data.title,
        desc: data.description,
        price: displayPrice,
        features: ["Instant Access", "Video Lessons", "Secure Content"],
      }
    : { title: "Loading...", desc: "", price: 0, features: [] };

  return (
    <div className="size-full bg-white rounded-4xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-5 md:p-8 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 right-0 size-32 bg-[#f0fdff] rounded-bl-[4rem] -mr-4 -mt-4 z-0 transition-transform duration-700 group-hover:scale-110" />
      <div className="relative z-10 flex flex-col">
        {/* --- THUMBNAIL --- */}
        <div className="w-full h-28 md:h-32 rounded-2xl overflow-hidden mb-4 shrink-0 bg-slate-100 border border-slate-100">
          <img
            src={imageUrl}
            alt={info.title}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="size-8 md:size-10 bg-[#f0fdff] rounded-xl flex items-center justify-center text-[#0891b2] shrink-0">
            <Zap className="size-4 md:size-5" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 line-clamp-1">
            {info.title}
          </h3>
        </div>

        <p className="text-slate-500 text-xs md:text-sm font-medium line-clamp-2 mb-3">
          {info.desc}
        </p>
      </div>

      <div className="relative z-10 mt-auto">
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-3xl md:text-4xl font-bold text-slate-900">
            {info.price == 0 || info.price === "Free"
              ? "Free"
              : `₹${info.price}`}
          </span>
          <span className="text-slate-400 text-xs md:text-sm">/course</span>
        </div>
        <ul className="space-y-2 mb-4 md:mb-5">
          {info.features.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-xs md:text-sm text-slate-600 font-medium"
            >
              <div className="size-4 md:size-5 rounded-full bg-[#f0fdff] flex items-center justify-center shrink-0">
                <Check className="size-3 text-[#0891b2]" />
              </div>
              {item}
            </li>
          ))}
        </ul>
        <Link
          to={`/courses/${data?.id}`}
          className="w-full py-3 md:py-3.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm hover:bg-[#f0fdff] hover:border-[#cff9fe] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          View Details <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
};

// Style 2: Cyan Gradient Card (Full Stack Style)
const FullStackCard = ({ data }) => {
  const displayPrice = data ? data.price : 5999;
  const imageUrl = getCourseImage(data);
  const info = data
    ? {
        title: data.title,
        desc: data.description,
        price: displayPrice,
        features: ["Full Course Access", "Certificate", "Lifetime Updates"],
      }
    : { title: "Loading...", desc: "", price: 0, features: [] };

  return (
    <div className="size-full bg-linear-to-br from-[#5edff4] to-[#06b6d4] rounded-4xl shadow-2xl shadow-[#5edff4]/40 p-5 md:p-8 flex flex-col justify-between relative overflow-hidden border border-white/20 group">
      <div className="relative z-10 flex flex-col">
        {/* --- THUMBNAIL --- */}
        <div className="w-full h-28 md:h-32 rounded-2xl overflow-hidden mb-4 shrink-0 bg-white/10 border border-white/20">
          <img
            src={imageUrl}
            alt={info.title}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
          />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="size-8 md:size-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-inner border border-white/20 shrink-0">
            <Crown className="size-4 md:size-5" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white line-clamp-1">
            {info.title}
          </h3>
        </div>

        <p className="text-[#cff9fe] text-xs md:text-sm font-medium line-clamp-2 mb-3">
          {info.desc}
        </p>
      </div>

      <div className="relative z-10 mt-auto">
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-3xl md:text-4xl font-bold text-white">
            {info.price == 0 || info.price === "Free"
              ? "Free"
              : `₹${info.price}`}
          </span>
        </div>
        <ul className="space-y-2 mb-4 md:mb-5">
          {info.features.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-xs md:text-sm text-white font-medium"
            >
              <div className="size-4 md:size-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check className="size-3 text-white" />
              </div>
              {item}
            </li>
          ))}
        </ul>
        <Link
          to={`/courses/${data?.id}`}
          className="w-full py-3 md:py-3.5 rounded-xl bg-white text-[#0891b2] font-bold text-sm hover:bg-[#f0fdff] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          Enroll Now <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
};

// Style 3: Dark Card (Data Science Style)
const DataScienceCard = ({ data }) => {
  const displayPrice = data ? data.price : 7999;
  const imageUrl = getCourseImage(data);
  const info = data
    ? {
        title: data.title,
        desc: data.description,
        price: displayPrice,
        features: ["HD Video Lessons", "Project Files", "Mobile Access"],
      }
    : { title: "Loading...", desc: "", price: 0, features: [] };

  return (
    <div className="size-full bg-slate-900 rounded-4xl border border-slate-800 shadow-2xl shadow-slate-900/50 p-5 md:p-8 flex flex-col justify-between relative overflow-hidden group">
      <div className="relative z-10 flex flex-col">
        {/* --- THUMBNAIL --- */}
        <div className="w-full h-28 md:h-32 rounded-2xl overflow-hidden mb-4 shrink-0 bg-slate-800 border border-slate-700">
          <img
            src={imageUrl}
            alt={info.title}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
          />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="size-8 md:size-10 bg-slate-800 rounded-xl flex items-center justify-center text-white border border-slate-700 shadow-lg shrink-0">
            <Star className="size-4 md:size-5 text-[#5edff4]" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white line-clamp-1">
            {info.title}
          </h3>
        </div>

        <p className="text-slate-400 text-xs md:text-sm font-medium line-clamp-2 mb-3">
          {info.desc}
        </p>
      </div>

      <div className="relative z-10 mt-auto">
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-3xl md:text-4xl font-bold text-white">
            {info.price == 0 || info.price === "Free"
              ? "Free"
              : `₹${info.price}`}
          </span>
        </div>
        <ul className="space-y-2 mb-4 md:mb-5">
          {info.features.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-xs md:text-sm text-slate-300 font-medium"
            >
              <div className="size-4 md:size-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <Check className="size-3 text-[#5edff4]" />
              </div>
              {item}
            </li>
          ))}
        </ul>
        <Link
          to={`/courses/${data?.id}`}
          className="w-full py-3 md:py-3.5 rounded-xl bg-slate-800 text-white border border-slate-700 font-bold text-sm hover:bg-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          View Details <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
};

// Array of Designs to cycle through
const CARD_STYLES = [FrontendCard, FullStackCard, DataScienceCard];

// ==========================================
// SECTION 2: 3D ENGINE
// ==========================================

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute top-1/2 left-1/2 transform-3d will-change-transform backface-hidden ${
      customClass ?? ""
    } ${rest.className ?? ""}`.trim()}
  />
));
Card.displayName = "Card";

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  });

const SwapEngine = ({
  width,
  height,
  cardDistance,
  verticalDistance,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = "elastic",
  children,
}) => {
  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    [childArr.length],
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef(null);
  const intervalRef = useRef();
  const container = useRef(null);

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) =>
      placeNow(
        r.current,
        makeSlot(i, cardDistance, verticalDistance, total),
        skewAmount,
      ),
    );

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: "+=300",
        opacity: 0,
        rotation: -5,
        duration: config.durDrop,
        ease: "power2.in",
      });

      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${i * 0.15}`,
        );
      });

      const backSlot = makeSlot(
        refs.length - 1,
        cardDistance,
        verticalDistance,
        refs.length,
      );
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, {
            zIndex: backSlot.zIndex,
            opacity: 0,
            rotation: 0,
          });
        },
        undefined,
        "return",
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          opacity: 1,
          duration: config.durReturn,
          ease: "power2.out",
        },
        "return",
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    if (childArr.length > 1) {
      swap();
      intervalRef.current = window.setInterval(swap, delay);
    }

    if (pauseOnHover) {
      const node = container.current;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        if (childArr.length > 1) {
          tlRef.current?.play();
          intervalRef.current = window.setInterval(swap, delay);
        }
      };
      node.addEventListener("mouseenter", pause);
      node.addEventListener("mouseleave", resume);
      return () => {
        node.removeEventListener("mouseenter", pause);
        node.removeEventListener("mouseleave", resume);
        clearInterval(intervalRef.current);
      };
    }
    return () => clearInterval(intervalRef.current);
  }, [
    cardDistance,
    verticalDistance,
    delay,
    pauseOnHover,
    skewAmount,
    easing,
    childArr.length,
  ]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e) => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          },
        })
      : child,
  );

  return (
    <div
      ref={container}
      className="relative flex items-center justify-center perspective-[900px] overflow-visible z-20"
      style={{ width, height }}
    >
      {rendered}
    </div>
  );
};

// ==========================================
// SECTION 3: RESPONSIVE LAYOUT & DATA FETCHING
// ==========================================

const CardsSwap = () => {
  const [courses, setCourses] = useState([]);

  // Setup Responsive Sizes (Adjusted to stop buttons from cutting off)
  const [cardWidth, setCardWidth] = useState(380);
  const [cardHeight, setCardHeight] = useState(540); // Increased height
  const [cardDist, setCardDist] = useState(25);
  const [vertDist, setVertDist] = useState(30);

  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 768) {
        setCardWidth(320);
        setCardHeight(520); // Taller for mobile
        setCardDist(15);
        setVertDist(20);
      } else {
        setCardWidth(380);
        setCardHeight(540); // Taller for desktop
        setCardDist(25);
        setVertDist(30);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Fetch ONLY Top 3 Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courseVideos"), limit(3)); // ONLY 3 CARDS
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCourses(data);
      } catch (e) {
        console.error("Error fetching courses for cards:", e);
      }
    };
    fetchCourses();
  }, []);

  return (
    <section className="w-full bg-transparent pt-0 md:pt-0 pb-0 overflow-hidden py-12 lg:py-24 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-auto lg:min-h-[600px] items-center gap-12 lg:gap-0">
            {/* --- TOP (Mobile) / LEFT (Desktop): Content --- */}
            <div className="flex flex-col justify-center relative z-10 w-full order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] md:text-xs font-bold tracking-wider uppercase mb-6 w-fit">
                <Bookmark className="size-3" />
                The Syllabus
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-4 md:mb-6">
                Choose Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5edff4] to-[#0891b2]">
                  Career Path.
                </span>
              </h2>

              <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8">
                From early intervention to advanced clinical specialization, Rehablito Academy
                guides you every step of the way.
              </p>

              <div className="space-y-5 md:space-y-6">
                {[
                  {
                    num: 1,
                    title: "Foundation",
                    desc: "Build your skills from the ground up.",
                    color: "bg-[#f0fdff] text-[#0891b2]",
                  },
                  {
                    num: 2,
                    title: "Specialization",
                    desc: "Master specific clinical care methods.",
                    color: "bg-slate-100 text-slate-600",
                  },
                  {
                    num: 3,
                    title: "Career Launch",
                    desc: "Turn Skills Into Career with expert guidance.",
                    color: "bg-[#5edff4]/10 text-[#0891b2]",
                  },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="flex gap-4 group cursor-default"
                  >
                    <div
                      className={`size-10 md:size-12 rounded-2xl ${item.color} flex items-center justify-center font-bold text-lg md:text-xl group-hover:scale-110 transition-transform`}
                    >
                      {item.num}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base">
                        {item.title}
                      </h4>
                      <p className="text-xs md:text-sm text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- BOTTOM (Mobile) / RIGHT (Desktop): 3D Cards --- */}
            <div className="w-full flex items-center justify-center relative overflow-visible order-2 mt-12 lg:mt-0">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="size-52 md:size-64 bg-[#5edff4]/20 rounded-full blur-[80px]" />
              </div>

              {courses.length > 0 ? (
                <SwapEngine
                  width={cardWidth}
                  height={cardHeight}
                  cardDistance={cardDist}
                  verticalDistance={vertDist}
                  delay={4000} // Slightly slower swap for better reading time
                  skewAmount={3}
                >
                  {courses.map((course, index) => {
                    const CardComponent =
                      CARD_STYLES[index % CARD_STYLES.length];
                    return (
                      <Card key={course.id}>
                        <CardComponent data={course} />
                      </Card>
                    );
                  })}
                </SwapEngine>
              ) : (
                <div
                  className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/50 flex items-center justify-center text-slate-400 font-medium"
                  style={{ width: cardWidth, height: cardHeight }}
                >
                  Loading Top Courses...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CardsSwap;
