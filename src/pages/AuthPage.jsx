import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Smile, ArrowRight, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const res = await AuthService.login(username, password); 
      if (res.success) {
        navigate(res.role === 'admin' ? '/admin' : '/app');
      } else {
        setError(res.message);
      }
    } else {
      if (!name || !username || !password) return setError('กรุณากรอกข้อมูลให้ครบ');
      
      const res = await AuthService.register(name, username, password);
      if (res.success) {
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        setIsLogin(true); 
        setError('');
        setPassword('');
      } else {
        setError(res.message);
      }
    }
  };

  return (
    // ✅ iOS Fix 1: ใช้ min-h-[100dvh] แทน min-h-screen เพื่อแก้ปัญหาความสูงจอใน Safari
    <div className="min-h-[100dvh] supports-[min-height:100dvh]:min-h-[100dvh] flex items-center justify-center bg-[#FDF2F8] relative overflow-hidden font-sans p-4">
      
      {/* 🎈 Decorative Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        // ✅ iOS Fix 2: เพิ่ม 'isolate' ใน className และเพิ่ม style WebkitMaskImage 
        // เพื่อบังคับให้ Safari ตัดขอบมน (rounded corners) อย่างถูกต้อง
        className="bg-white/80 backdrop-blur-lg rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 min-h-[600px] border-4 border-white relative z-10 isolate"
        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
      >
        
        {/* 🎨 Left Side: Image & Text */}
        <div className={`relative p-12 flex flex-col justify-center items-center text-center text-white transition-all duration-700 ease-in-out ${isLogin ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-pink-400 to-rose-500'}`}>
           {/* Pattern Overlay */}
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

           <motion.div 
             key={isLogin ? 'login-img' : 'reg-img'}
             initial={{ opacity: 0, scale: 0.5, rotate: -10 }} 
             animate={{ opacity: 1, scale: 1, rotate: 0 }}
             transition={{ type: "spring", stiffness: 200, damping: 15 }}
             className="text-9xl mb-8 drop-shadow-lg filter"
           >
             {isLogin ? '🔐' : '🦄'}
           </motion.div>

           <h2 className="text-4xl font-extrabold mb-4 tracking-tight relative">
             {isLogin ? 'Welcome Back!' : 'Join the Fun!'}
             <Sparkles className="absolute -top-6 -right-6 text-yellow-300 w-8 h-8 animate-bounce" />
           </h2>

           <p className="opacity-90 mb-10 font-medium text-lg max-w-xs leading-relaxed">
             {isLogin ? 'พร้อมจะเรียนรู้เรื่องใหม่ๆ หรือยัง? เข้าสู่ระบบกันเลย!' : 'มาเป็นครอบครัวเดียวกัน สมัครสมาชิกฟรี ใบงานเพียบ!'}
           </p>

           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => { setIsLogin(!isLogin); setError(''); }}
             className="px-10 py-3 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-sm font-bold text-lg hover:bg-white hover:text-indigo-600 transition-all shadow-lg"
           >
             {isLogin ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ'}
           </motion.button>
        </div>

        {/* 📝 Right Side: Form */}
        <div className="p-12 flex flex-col justify-center bg-white/50 relative">
           <div className="text-center mb-8">
             <h2 className={`text-4xl font-black mb-2 ${isLogin ? 'text-indigo-600' : 'text-pink-500'}`}>
               {isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
             </h2>
             <p className="text-gray-400 text-sm">กรอกข้อมูลของคุณด้านล่าง</p>
           </div>

           {error && (
             <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="bg-red-100 text-red-500 p-4 rounded-2xl text-sm mb-6 text-center font-bold border-2 border-red-200 flex items-center justify-center gap-2">
               ⚠️ {error}
             </motion.div>
           )}

           <form onSubmit={handleSubmit} className="space-y-5">
             <AnimatePresence> 
               {!isLogin && (
                 <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="overflow-hidden">
                    <div className="relative group">
                      <Smile className="absolute left-5 top-4 text-pink-300 group-focus-within:text-pink-500 transition-colors" size={24}/>
                      <input 
                        type="text" 
                        placeholder="ชื่อเล่นน่ารักๆ" 
                        className="w-full pl-14 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-pink-300 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium text-gray-600 placeholder-gray-300 shadow-sm" 
                        value={name} 
                        onChange={e=>setName(e.target.value)} 
                      />
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="relative group">
               <User className={`absolute left-5 top-4 transition-colors ${isLogin ? 'text-indigo-300 group-focus-within:text-indigo-500' : 'text-pink-300 group-focus-within:text-pink-500'}`} size={24}/>
               <input 
                 type="text" 
                 placeholder="Username" 
                 className={`w-full pl-14 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl outline-none transition-all font-medium text-gray-600 placeholder-gray-300 shadow-sm ${isLogin ? 'focus:border-indigo-300 focus:ring-indigo-100' : 'focus:border-pink-300 focus:ring-pink-100'} focus:ring-4`} 
                 value={username} 
                 onChange={e=>setUsername(e.target.value)} 
               />
             </div>

             <div className="relative group">
               <Lock className={`absolute left-5 top-4 transition-colors ${isLogin ? 'text-indigo-300 group-focus-within:text-indigo-500' : 'text-pink-300 group-focus-within:text-pink-500'}`} size={24}/>
               <input 
                 type="password" 
                 placeholder="Password" 
                 className={`w-full pl-14 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl outline-none transition-all font-medium text-gray-600 placeholder-gray-300 shadow-sm ${isLogin ? 'focus:border-indigo-300 focus:ring-indigo-100' : 'focus:border-pink-300 focus:ring-pink-100'} focus:ring-4`} 
                 value={password} 
                 onChange={e=>setPassword(e.target.value)} 
               />
             </div>

             <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-xl shadow-indigo-200/50 flex justify-center items-center gap-3 mt-4 transition-all ${isLogin ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-indigo-300' : 'bg-gradient-to-r from-pink-400 to-rose-500 hover:shadow-pink-300'}`}
             >
               {isLogin ? 'ไปลุยกันเลย!' : 'สมัครสมาชิก'} <ArrowRight size={22} strokeWidth={3}/>
             </motion.button>
           </form>

           {isLogin && (
             <p className="mt-8 text-center text-xs text-gray-400 font-medium">
               Media & Training Co., Ltd. | Trang 🌴
             </p>
           )}
        </div>
      </motion.div>
    </div>
  );
}