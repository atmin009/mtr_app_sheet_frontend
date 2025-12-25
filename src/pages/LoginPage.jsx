import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { Lock, User, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import { playClickSound } from '../utils/sound';

export default function LoginPage() {
  const navigate = useNavigate();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    playClickSound();
    const result = await AuthService.login(u, p);
    if (result.success) {
      navigate('/admin');
    } else {
      setErr(result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50 relative overflow-hidden px-4">
      
      {/* 🌸 Background Decor (ตกแต่งพื้นหลังให้น่ารัก) */}
      <div className="absolute top-10 left-[10%] text-rose-200 animate-pulse hidden md:block">
        <Sparkles size={60} strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-10 right-[10%] text-purple-200 animate-bounce duration-[3000ms] hidden md:block">
        <div className="w-20 h-20 rounded-full border-4 border-purple-100 opacity-50"></div>
      </div>

      {/* 🃏 Card Login */}
      <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-rose-100/50 w-full max-w-sm border border-white/50 relative z-10">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-tr from-rose-400 to-purple-500 p-4 rounded-full shadow-lg shadow-rose-200 transform hover:-translate-y-1 transition-transform duration-300">
                <KeyRound size={32} className="text-white" strokeWidth={2.5} />
            </div>
        </div>

        <h1 className="text-3xl font-black text-center mb-2 font-display bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-purple-600">
            Admin Login
        </h1>
        <p className="text-center text-slate-400 text-sm mb-8 font-medium">
            เข้าสู่ระบบเพื่อจัดการห้องเรียน
        </p>

        {/* Error Message */}
        {err && (
            <div className="bg-red-50 text-red-500 px-4 py-3 rounded-2xl mb-6 text-sm font-bold text-center border border-red-100 flex items-center justify-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> {err}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Input */}
          <div className="relative group">
            <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors">
                <User size={20} />
            </div>
            <input 
                type="text" 
                placeholder="ชื่อผู้ใช้งาน" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100 outline-none transition-all font-medium text-slate-600 placeholder:text-slate-400"
                value={u} 
                onChange={e => setU(e.target.value)} 
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-purple-500 transition-colors">
                <Lock size={20} />
            </div>
            <input 
                type="password" 
                placeholder="รหัสผ่าน" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium text-slate-600 placeholder:text-slate-400"
                value={p} 
                onChange={e => setP(e.target.value)} 
            />
          </div>

          {/* Login Button */}
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3.5 rounded-2xl font-bold text-lg shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:-translate-y-0.5 active:scale-95 transition-all mt-4">
            เข้าสู่ระบบ
          </button>
        </form>

        {/* Back Button */}
        <button 
            onClick={() => {
              playClickSound();
              navigate('/');
            }} 
            className="w-full mt-8 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors group"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> 
            กลับไปหน้าหลัก
        </button>

      </div>
    </div>
  );
}