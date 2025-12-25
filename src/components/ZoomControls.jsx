import { ZoomIn, ZoomOut, RefreshCcw } from "lucide-react";

export default function ZoomControls({ value, onZoomChange }) {
  // ✅ Helper: ปัดเศษทศนิยมให้แม่นยำ (ป้องกัน 1.1000000001)
  const fixNumber = (num) => Math.round(num * 100) / 100;

  const handleSliderChange = (e) => {
    onZoomChange(parseFloat(e.target.value));
  };

  const handleZoomOut = () => {
    onZoomChange((prev) => {
      const next = fixNumber(prev - 0.1);
      return Math.max(next, 0.5);
    });
  };

  const handleZoomIn = () => {
    onZoomChange((prev) => {
      const next = fixNumber(prev + 0.1);
      return Math.min(next, 1.5);
    });
  };

  const handleReset = () => {
    onZoomChange(1.0);
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* การ์ดหลัก */}
      <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50 flex flex-col items-center gap-2 w-12">
        
        {/* ปุ่ม Zoom In (+) */}
        <button
          onClick={handleZoomIn}
          disabled={value >= 1.5}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-rose-50 disabled:hover:text-rose-500 shadow-sm"
        >
          <ZoomIn size={18} />
        </button>

        {/* ✅ Slider แนวตั้งแบบ Cross-Browser 
            ใช้การหมุน -90deg (270deg) เพื่อให้ขวา(เดิม)ชี้ขึ้นด้านบน
            ทำให้ "เลื่อนขึ้น = ค่าเพิ่ม" เสมอ
        */}
        <div className="relative h-28 w-8 flex items-center justify-center py-2">
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={value}
            onChange={handleSliderChange}
            className="absolute appearance-none w-24 h-1.5 rounded-full bg-slate-200 outline-none"
            style={{
              transform: "rotate(-90deg)", // หมุนให้ตั้งขึ้น
              transformOrigin: "center",
            }}
          />
          
          {/* Custom CSS สำหรับ Thumb (หัวลูกศรเลื่อน) */}
          <style>{`
            input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              height: 16px;
              width: 16px;
              border-radius: 50%;
              background: #F43F5E; /* สี rose-500 */
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              cursor: grab;
              transition: transform 0.1s;
            }
            input[type=range]::-webkit-slider-thumb:active {
              transform: scale(1.2);
              cursor: grabbing;
            }
            input[type=range]::-moz-range-thumb {
              height: 16px;
              width: 16px;
              border-radius: 50%;
              background: #F43F5E;
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              cursor: grab;
            }
          `}</style>
        </div>

        {/* ปุ่ม Zoom Out (-) */}
        <button
          onClick={handleZoomOut}
          disabled={value <= 0.5}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-indigo-50 disabled:hover:text-indigo-500 shadow-sm"
        >
          <ZoomOut size={18} />
        </button>

        {/* แสดง % */}
        <span className="text-[10px] font-bold text-slate-500">
            {Math.round(value * 100)}%
        </span>
      </div>

      {/* ปุ่มรีเซ็ต (แสดงเฉพาะตอนที่มีการซูม) */}
      {value !== 1.0 && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 backdrop-blur text-white rounded-full shadow-lg hover:bg-slate-700 active:scale-95 transition-all text-xs font-bold animate-in fade-in slide-in-from-left-2 duration-300"
        >
          <RefreshCcw size={12} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}