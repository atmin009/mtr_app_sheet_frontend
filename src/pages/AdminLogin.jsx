import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService'; // ตรวจสอบว่ามีไฟล์นี้
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // เรียกใช้ AuthService (หรือจะยิง API ตรงนี้ก็ได้)
    const res = await AuthService.login(username, password);
    
    if (res.success) {
      // ถ้าผ่าน -> ไปหน้า Dashboard
      navigate('/admin');
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ผู้ดูแลระบบ</h1>
          <p className="text-slate-400 text-sm">กรุณาล็อกอินเพื่อเข้าสู่ระบบจัดการ</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-6 text-center font-bold border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'กำลังตรวจสอบ...' : <>เข้าสู่ระบบ <ArrowRight size={20} /></>}
          </button>
        </form>

        <button onClick={() => navigate('/')} className="w-full text-center text-slate-400 text-sm mt-6 hover:text-slate-600 font-bold">
          กลับไปหน้าหลัก
        </button>
      </div>
    </div>
  );
}