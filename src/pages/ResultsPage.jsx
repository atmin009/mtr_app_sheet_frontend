// src/pages/ResultsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { API } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { playClickSound } from "../utils/sound";
import {
  Download,
  ArrowLeft,
  SearchX,
  Loader,
  Eye,
  X,
  Sparkles,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Star,
  ExternalLink, // ✅ เพิ่ม icon นี้มาใช้กับปุ่มเต็มหน้าจอ
} from "lucide-react";
import QRCode from "react-qr-code";

export default function ResultsPage({ age, categories = [], onBack }) {
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ แสดง 4 ใบงานต่อหน้า (เหมือนเดิม)
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allData = await API.getWorksheets();

        const selectedAge = String(age ?? "").trim();
        const selectedCats = (categories || [])
          .map((c) => String(c ?? "").trim())
          .filter(Boolean);

        const filtered = (allData || []).filter((item) => {
          const itemAgeString = String(item.ageRange ?? item.age_range ?? "")
            .trim();

          // ✅ แก้ให้ match แบบไม่พัง
          const ageMatch =
            selectedAge.length > 0
              ? itemAgeString.includes(selectedAge)
              : true;

          const itemCat = String(
            item.category ?? item.category_name ?? item.subject ?? ""
          ).trim();

          const catMatch =
            selectedCats.length > 0 ? selectedCats.includes(itemCat) : true;

          return ageMatch && catMatch;
        });

        setWorksheets(filtered);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [age, categories]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = worksheets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(worksheets.length / itemsPerPage) || 1;

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

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  // ✅ แหล่ง QR ที่ปลอดภัยกว่า "#"
  const getQrValue = (sheet) => {
    const url = sheet?.pdfUrl || sheet?.pdf_url || sheet?.imageUrl || sheet?.image_url;
    return url || (typeof window !== "undefined" ? window.location.href : "https://example.com");
  };

  const openPreview = (sheet) => {
    playClickSound();
    setPreview(sheet);
  };
  const closePreview = () => {
    playClickSound();
    setPreview(null);
  };

  // ✅ ฟังก์ชันสำหรับดาวน์โหลดไฟล์ลงเครื่อง
  const handleDownload = async (url, title) => {
    playClickSound();
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      // ตั้งชื่อไฟล์ตามชื่อใบงาน หรือ default name
      link.download = `${title || 'worksheet'}.pdf`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: เปิดลิ้งค์ตรงๆ ถ้า fetch ไม่ได้
      window.open(url, '_blank');
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative bg-[#FDFBF7] font-body overflow-x-hidden">
      {/* Background Decor */}
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
          <div className="flex flex-row md:flex-row items-center md:items-start gap-3 md:gap-4 text-center md:text-left w-full md:w-auto">
            <button
              onClick={() => {
                playClickSound();
                onBack();
              }}
              className="
                group flex items-center justify-center 
                w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 
                rounded-full bg-white 
                border-[3px] border-slate-100 
                text-slate-400 
                hover:text-rose-500 hover:border-rose-200 
                shadow-sm transition-all hover:scale-110
                flex-shrink-0
              "
            >
              <ArrowLeft size={22} strokeWidth={3} className="sm:w-6 sm:h-6" />
            </button>

            <div className="flex flex-col">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm mb-1 self-center md:self-start"
              >
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="font-sans text-slate-500 font-bold text-[11px] sm:text-xs">
                  วิชา: {categories.slice(0, 2).join(", ")}
                  {categories.length > 2 ? "..." : ""}
                </span>
              </motion.div>

              <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-700 leading-tight">
                ใบงานน้อง <span className="text-rose-500">{age}</span>
              </h2>
            </div>
          </div>

          <div className="mt-1 md:mt-0 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl border-[3px] border-slate-100 flex items-center gap-2 sm:gap-3 shadow-sm">
            <span className="font-sans text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              เจอทั้งหมด
            </span>
            <span className="font-sans text-2xl sm:text-3xl font-black text-rose-500">
              {worksheets.length}
            </span>
            <span className="font-sans text-[10px] sm:text-xs font-bold text-slate-400">
              ใบ
            </span>
          </div>
        </div>
      </div>
      {/* ========== END HEADER SECTION ========== */}

      {/* ========== CONTENT SECTION ========== */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden px-2 sm:px-3 md:px-4 lg:px-8 pb-20 sm:pb-24 pt-2 sm:pt-3 md:pt-4 relative z-10" style={{ minHeight: 0 }}>
        <div className="w-full flex flex-col items-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader size={40} className="text-rose-400 animate-spin mb-4" />
              <p className="font-sans text-slate-400 font-bold text-base sm:text-lg animate-pulse">
                กำลังค้นหา...
              </p>
            </div>
          ) : worksheets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <div className="bg-slate-100 p-5 rounded-full mb-4">
                <SearchX size={40} className="text-slate-300" />
              </div>
              <h3 className="font-sans text-slate-500 font-bold text-lg sm:text-xl">
                ไม่พบใบงานที่เลือก
              </h3>
            </div>
          ) : (
            <div className="w-full min-h-full relative flex flex-col justify-center">
              {/* Background layer */}
              <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="hidden lg:block absolute -left-6 top-1/2 -translate-y-1/2 w-40 h-40 xl:w-52 xl:h-52 rounded-[2rem] bg-gradient-to-br from-sky-50 to-indigo-50 border border-slate-100 shadow-md opacity-80" />
                <div className="hidden md:block absolute -right-4 bottom-4 w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-gradient-to-tr from-emerald-50 via-teal-50 to-white border border-emerald-50 shadow-md opacity-80" />
                <div className="hidden sm:flex absolute left-2 bottom-2 lg:left-4 lg:bottom-4 items-center gap-2 bg-white/95 px-3 py-2 rounded-2xl border border-slate-100 shadow-sm max-w-[260px]">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                  </div>
                  <p className="text-[11px] leading-snug text-slate-500 font-semibold text-left">
                    คลิกใบงานเพื่อดูตัวอย่าง หรือสแกน QR ไปทำบนมือถือ / แท็บเล็ต
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
                  className="
                    grid 
                    grid-cols-2 
                    sm:grid-cols-2
                    md:grid-cols-3 
                    lg:grid-cols-4 
                    xl:grid-cols-4
                    gap-2 sm:gap-3 md:gap-4 lg:gap-6 
                    w-full 
                    content-start
                    pb-2
                  "
                >
                  {currentItems.map((sheet) => (
                    <motion.div
                      key={sheet.id}
                      whileHover={{ y: -5, scale: 1.02 }}
                      onClick={() => openPreview(sheet)}
                      className="
                        group relative p-3 
                        rounded-[1.6rem] sm:rounded-[1.8rem]
                        bg-white 
                        border-[2.5px] border-slate-100 
                        hover:border-rose-200 
                        shadow-sm hover:shadow-xl 
                        transition-all duration-300 
                        flex flex-col 
                        overflow-hidden
                      "
                    >
                      <div className="relative w-full overflow-hidden rounded-xl bg-slate-50 mb-2.5 sm:mb-3 border border-slate-100 aspect-[3/4] group-hover:border-rose-100 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                        <img
                          src={sheet.imageUrl || sheet.image_url}
                          alt={sheet.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://placehold.co/300x400/png?text=No+Image";
                          }}
                        />

                        <div className="absolute top-2 left-2 z-20">
                          <span className="font-sans bg-white/95 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-extrabold text-indigo-500 shadow-sm border border-indigo-50 flex items-center gap-1">
                            <Star
                              size={8}
                              fill="currentColor"
                              className="text-yellow-400"
                            />
                            {sheet.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col mt-auto gap-1">
                        <h3 className="font-sans font-bold text-slate-700 text-sm sm:text-base md:text-lg leading-tight line-clamp-1 text-center group-hover:text-rose-500 transition-colors px-1">
                          {sheet.title}
                        </h3>

                        {/* ✅ กันคลิกแล้ว bubble เปิด/ปิดผิดจังหวะ */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPreview(sheet);
                          }}
                          className="
                            font-sans
                            w-full mt-auto py-2 sm:py-2.5 md:py-3 
                            rounded-xl 
                            bg-indigo-50 text-indigo-500 
                            font-bold text-sm sm:text-base md:text-lg 
                            border border-indigo-100 
                            hover:bg-rose-500 
                            hover:text-white 
                            hover:border-rose-500 
                            transition-all shadow-sm 
                            flex items-center justify-center gap-2
                          "
                        >
                          <Eye size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          ดูตัวอย่าง
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* 3. PAGINATION BAR */}
      {!loading && totalPages > 1 && (
        <div className="absolute bottom-4 sm:bottom-5 left-0 right-0 px-3 sm:px-4 z-30 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-4 sm:gap-5 md:gap-6 bg-white/95 backdrop-blur px-5 sm:px-7 md:px-8 py-2 sm:py-3 md:py-4 rounded-[1.6rem] sm:rounded-[2rem] shadow-md sm:shadow-lg border border-slate-100">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`
                flex items-center justify-center rounded-full 
                transition-all border-2
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
                flex items-center justify-center rounded-full 
                transition-all border-2
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

      {/* Modal Preview */}
      <AnimatePresence>
        {preview && (
          <div
            className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.86, opacity: 0, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.86, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="
                bg-white 
                w-full max-w-4xl 
                h-[90vh] sm:h-[88vh] md:h-[85vh] 
                rounded-xl sm:rounded-2xl md:rounded-[32px] 
                shadow-2xl flex flex-col relative overflow-hidden 
                ring-2 sm:ring-4 md:ring-8 ring-white/30
              "
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />

              <button
                onClick={closePreview}
                className="
                  absolute top-3 right-3 sm:top-4 sm:right-4 z-20 
                  w-9 h-9 sm:w-10 sm:h-10 
                  bg-white rounded-full shadow-lg 
                  border border-slate-100 
                  text-slate-400 
                  hover:text-rose-500 hover:rotate-90 
                  transition-all flex items-center justify-center
                "
              >
                <X size={22} strokeWidth={3} className="sm:w-6 sm:h-6" />
              </button>

              <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] p-3 sm:p-4 md:p-6">
                {preview.pdfUrl || preview.pdf_url ? (
                  <iframe
                    src={preview.pdfUrl || preview.pdf_url}
                    className="w-full h-full rounded-xl sm:rounded-2xl border-4 border-white shadow-sm bg-white"
                    title="PDF Preview"
                  />
                ) : (
                  <img
                    src={preview.imageUrl || preview.image_url}
                    className="max-h-full max-w-full object-contain rounded-xl sm:rounded-2xl shadow-lg border-4 border-white bg-white"
                    alt="Preview"
                  />
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center p-3 sm:p-4 md:p-5 bg-white border-t-2 border-slate-50 gap-2 sm:gap-3 md:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 bg-indigo-50/60 px-3 py-2 sm:p-2 sm:pr-5 rounded-2xl border border-indigo-50 w-full md:w-auto">
                  <div className="bg-white p-2 rounded-xl shadow-sm flex-shrink-0">
                    <QRCode
                      value={getQrValue(preview)}
                      size={44}
                      fgColor="#4F46E5"
                      bgColor="transparent"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-sans text-[9px] sm:text-[10px] text-indigo-400 font-black uppercase tracking-wider mb-0.5">
                      Scan to Mobile
                    </p>
                    <p className="font-sans text-slate-700 font-bold text-xs sm:text-sm">
                      สแกนไปทำบนมือถือ / แท็บเล็ต
                    </p>
                  </div>
                </div>

                {/* ✅ ส่วนปุ่ม Action ด้านขวา (มี 2 ปุ่ม) */}
                <div className="flex flex-row w-full md:w-auto gap-2">
                  {/* 1. ปุ่มดาวน์โหลดลงเครื่อง */}
                  <button
                    onClick={() => handleDownload(preview.pdfUrl || preview.pdf_url || preview.imageUrl || preview.image_url, preview.title)}
                    className="
                      font-sans flex-1 md:flex-none
                      flex items-center justify-center gap-2
                      bg-orange-500 text-white 
                      px-4 sm:px-6 py-2.5 sm:py-3 
                      rounded-2xl 
                      font-bold text-sm sm:text-base 
                      shadow-[0_4px_0_0_#C2410C] 
                      hover:shadow-[0_2px_0_0_#C2410C] 
                      hover:translate-y-[2px] 
                      active:shadow-none active:translate-y-[4px] 
                      transition-all
                    "
                  >
                    <Download size={18} className="sm:w-5 sm:h-5" strokeWidth={3} />
                    บันทึกลงเครื่อง
                  </button>

                  {/* 2. ปุ่มเปิดเต็มหน้าจอ (New Tab) */}
                  <a
                    href={preview.pdfUrl || preview.pdf_url || preview.imageUrl || preview.image_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      font-sans flex-1 md:flex-none
                      flex items-center justify-center gap-2
                      bg-rose-500 text-white 
                      px-4 sm:px-6 py-2.5 sm:py-3 
                      rounded-2xl 
                      font-bold text-sm sm:text-base 
                      shadow-[0_4px_0_0_rgba(190,18,60,1)] 
                      hover:shadow-[0_2px_0_0_rgba(190,18,60,1)] 
                      hover:translate-y-[2px] 
                      active:shadow-none active:translate-y-[4px] 
                      transition-all
                    "
                  >
                    <ExternalLink size={18} className="sm:w-5 sm:h-5" strokeWidth={3} />
                    เต็มหน้าจอ
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}