// src/services/localService.js

const DB_KEY = 'worksheets_db_v4';
const CAT_KEY = 'categories_db_v1';
const DEFAULT_CATS = ['ศิลปะ', 'ภาษาไทย', 'คณิตศาสตร์', 'วิทยาศาสตร์', 'อังกฤษ'];

export const LocalService = {
  // --- อ่านข้อมูล ---
  getAll: () => {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading data", e);
      return [];
    }
  },
  
  // กัน Error ชื่อฟังก์ชันเก่า (เผื่อไฟล์ไหนยังเรียกใช้อยู่)
  getAllWorksheets: () => {
    return LocalService.getAll();
  },

  // --- เพิ่มข้อมูล (ดัก Error เมมเต็ม) ---
  add: (item) => {
    try {
      const all = LocalService.getAll();
      const newItem = { id: Date.now(), ...item, createdAt: Date.now() };
      localStorage.setItem(DB_KEY, JSON.stringify([newItem, ...all]));
    } catch (e) {
      // ถ้าเมมเต็ม จะเข้าตรงนี้
      alert("❌ พื้นที่จัดเก็บเต็ม! (Quota Exceeded)\nไม่สามารถบันทึกเพิ่มได้ กรุณาลบรายการเก่าออกบ้างครับ");
      console.error("Storage full:", e);
    }
  },

  // --- อัปเดตข้อมูล ---
  update: (id, item) => {
    try {
      const all = LocalService.getAll();
      const index = all.findIndex(x => x.id === id);
      if (index !== -1) {
        all[index] = { ...all[index], ...item };
        localStorage.setItem(DB_KEY, JSON.stringify(all));
      }
    } catch (e) {
      alert("❌ บันทึกแก้ไขไม่ได้ พื้นที่จัดเก็บเต็มครับ");
    }
  },

  // --- ลบข้อมูล ---
  delete: (id) => {
    const all = LocalService.getAll();
    const newAll = all.filter(x => x.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(newAll));
  },
  
  // --- จัดการวิชา ---
  getCategories: () => {
    const data = localStorage.getItem(CAT_KEY);
    if (!data) {
        localStorage.setItem(CAT_KEY, JSON.stringify(DEFAULT_CATS));
        return DEFAULT_CATS;
    }
    return JSON.parse(data);
  },
  addCategory: (catName) => {
    try {
      const cats = LocalService.getCategories();
      if (!cats.includes(catName)) {
          const newCats = [...cats, catName];
          localStorage.setItem(CAT_KEY, JSON.stringify(newCats));
      }
    } catch (e) {
      alert("❌ เพิ่มวิชาไม่ได้ พื้นที่เต็มครับ");
    }
  },
  deleteCategory: (catName) => {
    const cats = LocalService.getCategories();
    const newCats = cats.filter(c => c !== catName);
    localStorage.setItem(CAT_KEY, JSON.stringify(newCats));
  },

  // --- แปลงไฟล์เป็น Base64 ---
  convertFileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  },
  
  // (แถม) สร้าง URL ชั่วคราวสำหรับพรีวิวไวๆ
  createFileUrl: (file) => {
      return URL.createObjectURL(file);
  }
};