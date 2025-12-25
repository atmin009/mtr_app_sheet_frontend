import axios from 'axios';

// ลิงก์เดียวกับ api.js ตรงนี้ backend 3000
const API_URL = 'http://147.50.254.108:3000/api'; 
const SESSION_KEY = 'current_session_v5';

export const AuthService = {
  // ดึงข้อมูลคนล็อกอินปัจจุบัน (จากความจำเครื่อง)
  getCurrentUser: () => {
    const json = localStorage.getItem(SESSION_KEY);
    return json ? JSON.parse(json) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(SESSION_KEY);
  },

  isAdmin: () => {
    const user = AuthService.getCurrentUser();
    return user && user.role === 'admin';
  },

  // --- Login ผ่าน MySQL ---
  login: async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      if (res.data.success) {
        // ถ้าถูก บันทึก Session ลงเครื่อง
        localStorage.setItem(SESSION_KEY, JSON.stringify(res.data.user));
        return { success: true, role: res.data.user.role };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (error) {
      return { success: false, message: 'เชื่อมต่อ Server ไม่ได้' };
    }
  },

  // --- Register ผ่าน MySQL ---
  register: async (name, username, password) => {
    try {
      const res = await axios.post(`${API_URL}/register`, { name, username, password });
      return res.data; // { success: true/false, message: ... }
    } catch (error) {
      return { success: false, message: 'เชื่อมต่อ Server ไม่ได้' };
    }
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};