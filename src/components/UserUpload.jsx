import { useEffect, useState } from 'react';
import { LocalService } from '../services/localService';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, SearchX } from 'lucide-react';

export default function ResultsPage({ age, categories, onBack }) {
  const [worksheets, setWorksheets] = useState([]);

  useEffect(() => {
    // ดึงข้อมูลทั้งหมด
    const all = LocalService.getAll();
    // กรองข้อมูล: อายุตรงกัน และ หมวดหมู่ต้องอยู่ในที่เลือกมา
    const filtered = all.filter(item => 
        item.ageRange === age && categories.includes(item.category)
    );
    setWorksheets(filtered);
  }, [age, categories]);

  return (
    <div>
        <button onClick={onBack} className="mb-6 text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-2 bg-white px-4 py-2 rounded-full w-fit shadow-sm">
            <ArrowLeft size={18}/> เลือกวิชาใหม่
        </button>
        
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-display text-indigo-900 mb-2">ใบงานสำหรับน้อง {age} ปี</h2>
            <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                    <span key={c} className="px-3 py-1 bg-white text-indigo-600 rounded-lg text-sm font-bold border border-indigo-100 shadow-sm">{c}</span>
                ))}
            </div>
        </div>

        {worksheets.length === 0 ? (
            <div className="text-center py-20 bg-white/60 rounded-[3rem] border-4 border-dashed border-indigo-100">
                <SearchX className="mx-auto text-indigo-200 w-24 h-24"/>
                <p className="text-indigo-400 mt-4 font-bold text-xl">ไม่พบใบงานในหมวดนี้จ้ะ</p>
                <p className="text-indigo-300">ลองเลือกวิชาอื่นดูนะ</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {worksheets.map((sheet, i) => (
                    <motion.div 
                        key={sheet.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-[2rem] overflow-hidden shadow-lg hover:-translate-y-2 transition-transform duration-300 group border-4 border-white"
                    >
                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                            <img src={sheet.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                            <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm border border-indigo-50">
                                {sheet.category}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-lg mb-3 line-clamp-1 text-gray-800 font-display">{sheet.title}</h3>
                            <a href={sheet.pdfUrl} target="_blank" className="flex items-center justify-center gap-2 w-full bg-indigo-50 text-indigo-600 py-3 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 hover:border-indigo-600">
                                <Download size={20}/> ดาวน์โหลด
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
    </div>
  );
}