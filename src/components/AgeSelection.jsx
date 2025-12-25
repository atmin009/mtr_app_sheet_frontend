import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Baby,
  Shapes,
  Rocket,
  Star,
  Backpack,
  Brain,
  Layers,
  FolderOpen,
  Cloud,
  Sun,
  ChevronLeft,
  ChevronRight,
  Loader,
} from "lucide-react";
import { API } from "../services/api";
import { playClickSound } from "../utils/sound";

// ✅ แมปชื่อ icon จาก DB → เป็น component จริง
const ICON_MAP = {
  Baby,
  Shapes,
  Rocket,
  Star,
  Backpack,
  Brain,
  Layers,
  FolderOpen,
};

const DEFAULT_AGE_OPTIONS = [];

const AgeCard = ({ id, label, desc, color, icon: Icon, logoUrl, onClick }) => {
  const [logoOk, setLogoOk] = useState(true);

  useEffect(() => {
    setLogoOk(true);
  }, [logoUrl]);

  const colorMap = {
    green: { border: "border-emerald-200", text: "text-emerald-600", subText: "text-emerald-500", iconBg: "bg-emerald-100", hover: "hover:border-emerald-400" },
    orange:{ border: "border-orange-200", text: "text-orange-600", subText: "text-orange-600", iconBg: "bg-orange-100", hover: "hover:border-orange-400" },
    blue:  { border: "border-sky-200", text: "text-sky-600", subText: "text-sky-500", iconBg: "bg-sky-100", hover: "hover:border-sky-400" },
    pink:  { border: "border-rose-200", text: "text-rose-600", subText: "text-rose-500", iconBg: "bg-rose-100", hover: "hover:border-rose-400" },
    purple:{ border: "border-purple-200", text: "text-purple-600", subText: "text-purple-500", iconBg: "bg-purple-100", hover: "hover:border-purple-400" },
    yellow:{ border: "border-amber-200", text: "text-amber-600", subText: "text-amber-500", iconBg: "bg-amber-100", hover: "hover:border-amber-400" },
    red:   { border: "border-red-200", text: "text-red-600", subText: "text-red-500", iconBg: "bg-red-100", hover: "hover:border-red-400" },
    teal:  { border: "border-teal-200", text: "text-teal-600", subText: "text-teal-500", iconBg: "bg-teal-100", hover: "hover:border-teal-400" },
  };
  const c = colorMap[color] || colorMap.green;

  const handleClick = () => {
    playClickSound();
    onClick(id);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-center 
        p-3 sm:p-4 h-full w-full
        bg-white rounded-[1.6rem] 
        border-[2.5px] ${c.border} ${c.hover}
        shadow-sm hover:shadow-lg
        transition-all duration-300 group overflow-hidden
      `}
    >
      {/* ✅ วงกลมโลโก้/ไอคอน "ขนาดคงที่" */}
      <div
        className={`
          mb-3 sm:mb-4
          w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28
          flex items-center justify-center
          ${c.iconBg} rounded-full shadow-inner 
          group-hover:scale-110 transition-transform duration-300 
          border-2 border-white overflow-hidden
        `}
      >
        {logoUrl && logoOk ? (
          <img
            src={logoUrl}
            alt={label}
            className="w-full h-full object-cover rounded-full"
            onError={() => setLogoOk(false)}
          />
        ) : (
          <Icon className={`${c.text} w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 stroke-[2.5px]`} />
        )}
      </div>

      <div className="text-center z-10 flex flex-col items-center gap-1">
        <h3 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-700 leading-tight">
          {label}
        </h3>
        <div className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-slate-50 rounded-lg border border-slate-100 mt-1">
          <p className={`text-sm sm:text-base md:text-lg font-semibold ${c.subText}`}>
            {desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
};


export default function AgeSelection({ onSelectAge }) {
  const [ageOptions, setAgeOptions] = useState(DEFAULT_AGE_OPTIONS);

  useEffect(() => {
    const fetchAgeGroups = async () => {
      try {
        const ages = await API.getAgeGroups();
        if (ages && ages.length > 0) {
          const mapped = ages.map((ag) => {
            const iconKey = ag.icon || ag.icon_name;
            const Icon = ICON_MAP[iconKey] || Baby;

            const ageValue = ag.ageValue || ag.age_value;
            const desc = ag.desc || ag.description;

            const logoUrl = ag.logoUrl || ag.logo_url || "";

            return {
              id: ageValue,
              label: ag.label || ageValue,
              desc: desc || "",
              color: ag.color || "green",
              icon: Icon,
              logoUrl,
            };
          });
          setAgeOptions(mapped);
        }
      } catch (err) {
        console.error("โหลด age-groups ไม่สำเร็จ ใช้ค่า default แทน", err);
      }
    };

    fetchAgeGroups();
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ageOptions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ageOptions.length / itemsPerPage) || 1;

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

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    return pageNumbers;
  };

  return (
    <div
      className="
        age-selection-page
        h-full w-full 
        flex flex-col items-center
        relative bg-[#FDFBF7]
        overflow-y-auto overflow-x-hidden
      "
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-10 left-[-2%] text-sky-200 animate-[bounce_8s_infinite] hidden md:block opacity-60 pointer-events-none">
        <Cloud size={100} fill="currentColor" strokeWidth={0} />
      </div>
      <div className="absolute top-20 right-[-2%] text-amber-200 animate-[spin_12s_linear_infinite] hidden md:block opacity-60 pointer-events-none">
        <Sun size={80} fill="currentColor" strokeWidth={0} />
      </div>
      <div className="absolute bottom-10 right-[5%] text-indigo-100 animate-[pulse_6s_infinite] hidden lg:block opacity-50 pointer-events-none">
        <Cloud size={80} fill="currentColor" strokeWidth={0} />
      </div>

      <div className="w-full min-h-full flex flex-col items-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 lg:px-6 z-10">
        <div className="text-center mb-3 sm:mb-4 md:mb-5 relative z-10 flex-none">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm mb-2 border border-slate-100"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-slate-400 font-semibold text-[11px] sm:text-xs tracking-wide">
              Kids Learning BY : Media & Training
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-700 mb-2 tracking-tight"
          >
            <span className="text-indigo-500">ห้องเรียน</span>
            <span className="text-pink-400">แห่ง</span>
            <span className="text-teal-500">การเรียนรู้</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-base sm:text-lg md:text-xl font-semibold max-w-2xl mx-auto px-2"
          >
            เลือกห้องเรียนที่เหมาะสมกับน้องๆ ตามช่วงวัยและรูปแบบการเรียนรู้
          </motion.p>
        </div>

        <div className="w-full flex-1 flex flex-col justify-start items-center mt-1 md:mt-2 relative">
          <div className="absolute inset-0 pointer-events-none -z-10">
            <div className="hidden md:block absolute -left-6 top-1/2 -translate-y-1/2 w-40 h-40 lg:w-52 lg:h-52 rounded-[2rem] bg-gradient-to-br from-sky-50 to-indigo-50 border border-slate-100 shadow-md opacity-80" />
            <div className="hidden md:block absolute -right-4 bottom-2 w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-tr from-emerald-50 via-teal-50 to-white border border-emerald-50 shadow-md opacity-80" />
            <div className="hidden sm:flex absolute left-3 bottom-3 lg:left-6 lg:bottom-4 items-center gap-2 bg-white/95 px-3 py-2 rounded-2xl border border-slate-100 shadow-sm max-w-[260px]" />
          </div>

          <AnimatePresence mode="wait">
            {ageOptions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <Loader className="text-slate-400 animate-spin mb-4" size={40} />
                <p className="text-slate-500 font-semibold text-base sm:text-lg">
                  กำลังโหลดข้อมูล...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="
                  grid 
                  grid-cols-2 
                  sm:grid-cols-3
                  md:grid-cols-4 
                  lg:grid-cols-4
                  gap-x-2 sm:gap-x-3 md:gap-x-4 
                  gap-y-2 sm:gap-y-3 md:gap-y-4 
                  auto-rows-fr 
                  w-full
                  pb-2
                "
              >
                {currentItems.map((opt, index) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="aspect-[4/3]"
                  >
                    <AgeCard
                      id={opt.id}
                      label={opt.label}
                      desc={opt.desc}
                      color={opt.color}
                      icon={opt.icon}
                      logoUrl={opt.logoUrl}
                      onClick={onSelectAge}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-none mt-2 sm:mt-3 flex flex-col items-center gap-2.5 sm:gap-3 w-full">
          {totalPages > 1 && (
            <div className="flex items-center gap-4 sm:gap-5 md:gap-6 bg-white/90 backdrop-blur px-5 sm:px-7 md:px-8 py-2 sm:py-3 md:py-4 rounded-[1.6rem] sm:rounded-[2rem] shadow-md sm:shadow-lg border border-slate-100">
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
                {getPageNumbers().map((number) => (
                  <button
                    key={number}
                    onClick={() => goToPage(number)}
                    className={`
                      rounded-full font-black transition-all border-2
                      w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14
                      text-base sm:text-lg md:text-xl
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
          )}

        </div>
      </div>
    </div>
  );
}
