// src/pages/UserFlow.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import AgeSelection from "../components/AgeSelection";
import CategorySelection from "../components/CategorySelection";
import ResultsPage from "./ResultsPage";

export default function UserFlow() {
  // Flow
  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [cats, setCats] = useState([]);

  return (
    // 🔹 Background Wrapper: gradient เต็มจอ
    <div className="h-screen w-screen overflow-hidden overflow-x-hidden bg-gradient-to-br from-sky-50 via-white to-pink-50 relative flex items-center justify-center">
      {/* 🌈 Soft gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-10 w-56 sm:w-60 h-56 sm:h-60 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 w-64 sm:w-72 h-64 sm:h-72 rounded-full bg-pink-100/70 blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-emerald-100/60 blur-2xl" />
        <div className="absolute bottom-10 left-1/4 w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-indigo-100/60 blur-2xl" />
      </div>

      {/* ==================== ส่วนเนื้อหา ==================== */}
      <div className="w-full h-full flex flex-col overflow-x-hidden">
        {/* 🔹 Content Area - เต็มจอ */}
        <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden relative">
          {/* เฟรมหลักของเนื้อหา - เต็มจอ */}
          <div className="w-full h-full flex flex-col relative">
            {/* แพเนลหลักของเด็ก - เต็มจอ */}
            <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="1"
                        className="w-full h-full"
                        initial={{ opacity: 0, scale: 0.97, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.03, y: -10 }}
                        transition={{ duration: 0.35 }}
                      >
                        <AgeSelection
                          onSelectAge={(a) => {
                            setAge(a);
                            setStep(2);
                          }}
                        />
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="2"
                        className="w-full h-full"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.35 }}
                      >
                        <CategorySelection
                          ageRange={age}
                          onBack={() => setStep(1)}
                          onSearch={(selectedCats) => {
                            setCats(selectedCats);
                            setStep(3);
                          }}
                        />
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="3"
                        className="w-full h-full"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.35 }}
                      >
                        <ResultsPage
                          age={age}
                          categories={cats}
                          onBack={() => setStep(2)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      {/* =================================================================== */}
    </div>
  );
}
