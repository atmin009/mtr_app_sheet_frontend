import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Loader,
  BookOpen,
  Calculator,
  FlaskConical,
  Palette,
  Languages,
  Globe,
  Puzzle,
  Shapes,
  Sparkles,
  CheckCircle2,
  Cloud,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API } from "../services/api";
import { playClickSound } from "../utils/sound";

// ฟังก์ชันเลือกธีมสี
const getStyle = (index) => {
  const styles = [
    {
      color: "purple",
      icon: BookOpen,
      border: "border-purple-200",
      text: "text-purple-600",
      subText: "text-purple-500",
      iconBg: "bg-purple-50",
      hover: "hover:border-purple-400",
    },
    {
      color: "blue",
      icon: Calculator,
      border: "border-sky-200",
      text: "text-sky-600",
      subText: "text-sky-500",
      iconBg: "bg-sky-50",
      hover: "hover:border-sky-400",
    },
    {
      color: "green",
      icon: FlaskConical,
      border: "border-emerald-200",
      text: "text-emerald-600",
      subText: "text-emerald-500",
      iconBg: "bg-emerald-50",
      hover: "hover:border-emerald-400",
    },
    {
      color: "pink",
      icon: Palette,
      border: "border-rose-200",
      text: "text-rose-600",
      subText: "text-rose-500",
      iconBg: "bg-rose-50",
      hover: "hover:border-rose-400",
    },
    {
      color: "yellow",
      icon: Shapes,
      border: "border-amber-200",
      text: "text-amber-600",
      subText: "text-amber-500",
      iconBg: "bg-amber-50",
      hover: "hover:border-amber-400",
    },
    {
      color: "orange",
      icon: Puzzle,
      border: "border-orange-200",
      text: "text-orange-600",
      subText: "text-orange-500",
      iconBg: "bg-orange-50",
      hover: "hover:border-orange-400",
    },
    {
      color: "teal",
      icon: Globe,
      border: "border-teal-200",
      text: "text-teal-600",
      subText: "text-teal-500",
      iconBg: "bg-teal-50",
      hover: "hover:border-teal-400",
    },
    {
      color: "indigo",
      icon: Languages,
      border: "border-indigo-200",
      text: "text-indigo-600",
      subText: "text-indigo-500",
      iconBg: "bg-indigo-50",
      hover: "hover:border-indigo-400",
    },
  ];
  return styles[index % styles.length];
};

export default function CategorySelection({ ageRange, onBack, onSearch }) {
  const aliveRef = useRef(true);

  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // ✅ เก็บเป็น id กันชื่อซ้ำ
  const [loading, setLoading] = useState(true);

  // ✅ ปก Cate ของ AgeGroup (จาก DB)
  const [ageCateCoverUrl, setAgeCateCoverUrl] = useState("");

  // ✅ กันกรณีรูปไอคอนวิชาพัง -> fallback เป็น lucide
  const [brokenCatIcon, setBrokenCatIcon] = useState({}); // { [catId]: true }

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    aliveRef.current = true;

    const fetchAll = async () => {
      if (!aliveRef.current) return;
      setLoading(true);

      try {
        const [allCats, allAges] = await Promise.all([
          API.getCategories(),
          API.getAgeGroups(),
        ]);

        // ✅ หา cover ของ ageRange ปัจจุบัน
        const matchAge = (allAges || []).find(
          (a) => a.ageValue === ageRange || a.age_value === ageRange
        );
        const cover =
          matchAge?.cateCoverUrl || matchAge?.cate_cover_url || "";

        // ✅ filter categories
        const filteredCats = (allCats || []).filter((c) => {
          const catAge = c.ageGroup ?? c.age_group;
          return catAge === ageRange;
        });

        if (!aliveRef.current) return;

        setAgeCateCoverUrl(cover);
        setCategories(filteredCats);
        setSelectedIds([]); // ✅ เปลี่ยนอายุแล้วล้างการเลือก
        setBrokenCatIcon({}); // ✅ ล้างสถานะรูปพัง
        setCurrentPage(1);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      aliveRef.current = false;
    };
  }, [ageRange]);

  const toggleCat = (catId) => {
    playClickSound();
    setSelectedIds((prev) =>
      prev.includes(catId)
        ? prev.filter((x) => x !== catId)
        : [...prev, catId]
    );
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage) || 1;

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      playClickSound();
      setCurrentPage((prev) => prev + 1);
    }
  };
  const goToPrevPage = () => {
    if (currentPage > 1) {
      playClickSound();
      setCurrentPage((prev) => prev - 1);
    }
  };
  const goToPage = (n) => {
    playClickSound();
    setCurrentPage(n);
  };

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  // ✅ ส่งออกเป็น "ชื่อวิชา" ให้เหมือนเดิม
  const selectedNames = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean);
  }, [selectedIds, categories]);

  return (
    <div className="h-full w-full flex flex-col relative bg-[#FDFBF7] font-body overflow-x-hidden">
      {/* ✅ Hero Cover (Cate Cover ของ AgeGroup) */}
      {ageCateCoverUrl && (
        <div className="absolute inset-x-0 top-0 h-56 sm:h-64 md:h-72 pointer-events-none -z-10">
          <img
            src={ageCateCoverUrl}
            alt={`cover-${ageRange}`}
            className="w-full h-full object-cover"
            onError={() => setAgeCateCoverUrl("")}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/70 to-[#FDFBF7]" />
          <div className="absolute inset-0 bg-white/10" />
        </div>
      )}

      {/* Background Decor หลัก */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-[5%] text-rose-200/40 animate-pulse hidden md:block">
          <Sparkles size={100} strokeWidth={1} />
        </div>
        <div className="absolute bottom-20 left-[5%] text-sky-200/40 hidden md:block animate-[bounce_8s_infinite]">
          <Cloud size={120} fill="currentColor" strokeWidth={0} />
        </div>
      </div>

      {/* ========== HEADER SECTION ========== */}
      <div className="flex-none w-full pt-2 sm:pt-3 pb-2 sm:pb-3 px-2 sm:px-4 md:px-6 lg:px-10 z-30 relative bg-[#FDFBF7] border-b border-slate-100/50">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <div className="flex flex-row md:flex-row items-center md:items-start gap-3 md:gap-4 w-full md:w-auto">
            <button
              onClick={() => {
                playClickSound();
                onBack();
              }}
              className="group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white border-[3px] border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 shadow-sm transition-all hover:scale-110 flex-shrink-0"
            >
              <ArrowLeft size={22} strokeWidth={3} className="sm:w-6 sm:h-6" />
            </button>

            <div className="text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm mb-1"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                  {ageCateCoverUrl ? (
                    <img
                      src={ageCateCoverUrl}
                      alt="cate-cover-thumb"
                      className="w-full h-full object-cover"
                      onError={() => setAgeCateCoverUrl("")}
                    />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  )}
                </div>

                <span className="text-slate-500 font-bold text-[11px] sm:text-xs font-sans">
                  ห้องเรียนน้อง {ageRange}
                </span>
              </motion.div>

              <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-700 leading-tight">
                <span className="text-indigo-500">อยากเก่ง</span>
                <span className="text-rose-400">วิชา</span>
                <span className="text-teal-500">ไหนบ้าง?</span>
              </h1>
            </div>
          </div>

          <div className="mt-2 md:mt-0 bg-white/80 backdrop-blur-sm px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl border-[3px] border-slate-100 flex items-center gap-2 sm:gap-3 shadow-sm">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
              เลือกแล้ว
            </span>
            <span className="font-sans text-2xl sm:text-3xl font-black text-rose-500">
              {selectedIds.length}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 font-sans">
              วิชา
            </span>
          </div>
        </div>
      </div>
      {/* ========== END HEADER SECTION ========== */}

      {/* ========== CONTENT SECTION ========== */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden px-2 sm:px-3 md:px-4 lg:px-8 pb-20 sm:pb-24 pt-2 sm:pt-3 md:pt-4 relative z-10" style={{ minHeight: 0 }}>
        <div className="w-full flex flex-col items-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 h-full">
              <Loader size={40} className="text-rose-400 animate-spin mb-4" />
              <p className="text-slate-400 font-bold text-base sm:text-lg animate-pulse font-sans">
                กำลังจัดเตรียมห้องเรียน...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-70">
              <div className="bg-slate-100 p-5 rounded-full mb-4">
                <Search size={40} className="text-slate-300" />
              </div>
              <h3 className="font-sans text-slate-500 font-bold text-lg sm:text-xl">
                ยังไม่มีวิชาในหมวดนี้
              </h3>
            </div>
          ) : (
            <div className="w-full min-h-full relative flex flex-col justify-center">
              <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="hidden lg:block absolute -left-6 top-1/2 -translate-y-1/2 w-40 h-40 xl:w-52 xl:h-52 rounded-[2rem] bg-gradient-to-br from-sky-50 to-indigo-50 border border-slate-100 shadow-md opacity-80" />
                <div className="hidden md:block absolute -right-4 bottom-4 w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-gradient-to-tr from-emerald-50 via-teal-50 to-white border border-emerald-50 shadow-md opacity-80" />

                <div className="hidden sm:flex absolute left-2 bottom-1 lg:left-4 lg:bottom-3 items-center gap-2 bg-white/95 px-3 py-2 rounded-2xl border border-slate-100 shadow-sm max-w-[280px]">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-[11px] leading-snug text-slate-500 font-semibold text-left">
                    เลือกได้มากกว่าหนึ่งวิชา เพื่อให้ระบบค้นหาใบงานตามความสนใจของน้อง ๆ
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full content-center pb-2"
                >
                  {currentItems.map((cat, index) => {
                    const isActive = selectedIds.includes(cat.id);

                    const globalIndex = indexOfFirstItem + index;
                    const style = getStyle(globalIndex);
                    const FallbackIcon = style.icon;

                    const catIconUrl = cat.iconUrl || cat.icon_url || "";
                    const canUseImage = !!catIconUrl && !brokenCatIcon[cat.id];

                    return (
                      <motion.div
                        key={cat.id}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleCat(cat.id)}
                        className={`
                          relative p-3 sm:p-4 rounded-[1.6rem] 
                          flex flex-col items-center justify-center text-center
                          bg-white border-[2.5px] group aspect-[4/3]
                          transition-all duration-300 shadow-sm hover:shadow-lg
                          ${
                            isActive
                              ? "border-rose-400 shadow-xl ring-4 ring-rose-100 z-10"
                              : `${style.border} ${style.hover}`
                          }
                        `}
                      >
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-rose-500 bg-white rounded-full p-0.5 shadow-sm z-20"
                            >
                              <CheckCircle2
                                size={22}
                                strokeWidth={3}
                                className="text-rose-500"
                                fill="currentColor"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div
                          className={`
                            mb-3 sm:mb-4 p-3 sm:p-4 md:p-5 rounded-full shadow-inner 
                            transition-transform duration-300 border-2 border-white
                            flex items-center justify-center
                            ${
                              isActive
                                ? "bg-rose-100 scale-110"
                                : `${style.iconBg} group-hover:scale-110`
                            }
                          `}
                        >
                          {canUseImage ? (
                            <img
                              src={catIconUrl}
                              alt={`icon-${cat.name}`}
                              className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 object-contain ${
                                isActive ? "drop-shadow-sm" : ""
                              }`}
                              onError={() =>
                                setBrokenCatIcon((prev) => ({
                                  ...prev,
                                  [cat.id]: true,
                                }))
                              }
                            />
                          ) : (
                            <FallbackIcon
                              className={`${
                                isActive ? "text-rose-500" : style.text
                              } w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 stroke-[2.5px]`}
                            />
                          )}
                        </div>

                        <h3
                          className={`
                            font-sans text-base sm:text-lg md:text-xl lg:text-2xl font-black leading-tight
                            ${isActive ? "text-rose-600" : "text-slate-700"}
                          `}
                        >
                          {cat.name}
                        </h3>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="absolute bottom-4 sm:bottom-5 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-4 sm:gap-5 md:gap-6 bg-white/95 backdrop-blur px-5 sm:px-7 md:px-8 py-2 sm:py-3 md:py-4 rounded-[1.6rem] sm:rounded-[2rem] shadow-md sm:shadow-lg border border-slate-100">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`
                flex items-center justify-center rounded-full transition-all border-2
                w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14
                ${
                  currentPage === 1
                    ? "text-slate-300 border-slate-100 cursor-not-allowed"
                    : "text-rose-400 border-rose-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"
                }
              `}
            >
              <ChevronLeft size={22} strokeWidth={3} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => goToPage(number)}
                  className={`
                    font-sans rounded-full font-black transition-all border-2
                    w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 text-base sm:text-lg md:text-xl
                    ${
                      currentPage === number
                        ? "bg-[#FF3366] text-white border-[#FF3366] shadow-md shadow-rose-200 scale-105 sm:scale-110"
                        : "bg-white text-slate-400 border-slate-100 hover:text-rose-500 hover:border-rose-100"
                    }
                  `}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`
                flex items-center justify-center rounded-full transition-all border-2
                w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14
                ${
                  currentPage === totalPages
                    ? "text-slate-300 border-slate-100 cursor-not-allowed"
                    : "text-rose-400 border-rose-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"
                }
              `}
            >
              <ChevronRight size={22} strokeWidth={3} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </button>
          </div>
        </div>
      )}

      {/* Action Button */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute bottom-14 sm:bottom-16 md:bottom-20 right-2 sm:right-4 md:right-6 z-40"
          >
            <button
              onClick={() => {
                playClickSound();
                onSearch?.(selectedNames);
              }}
              className="
                font-sans flex items-center gap-3 sm:gap-4
                bg-indigo-600 text-white
                border-[3px] border-white/70
                py-3 sm:py-4 md:py-5 px-6 sm:px-8 md:px-10 rounded-full
                shadow-[0_14px_30px_-18px_rgba(79,70,229,0.55)]
                hover:bg-indigo-700 hover:-translate-y-1
                active:translate-y-0 active:scale-[0.99]
                transition-all
                min-w-[180px] sm:min-w-[220px] md:min-w-[260px]
                text-base sm:text-lg md:text-xl
              "
            >
              <Search size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={3} />
              <span>ค้นหาใบงาน</span>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm sm:text-base md:text-lg font-black min-w-[28px] text-center">
                {selectedIds.length}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
