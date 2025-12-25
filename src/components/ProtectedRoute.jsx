import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/authService';

export default function ProtectedRoute({ children, role }) {
  // 1. เช็คว่าล็อกอินยัง?
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  // 2. ถ้ามีการระบุ Role (เช่นต้องเป็น admin เท่านั้น) ให้เช็ค role ด้วย
  if (role === 'admin' && !AuthService.isAdmin()) {
    // ถ้าไม่ใช่ admin แต่พยายามเข้า -> ดีดไปหน้า user ปกติ
    return <Navigate to="/app" replace />;
  }

  return children;
}