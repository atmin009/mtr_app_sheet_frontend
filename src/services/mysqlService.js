import axios from 'axios';

//  ลิงก์ Backend (server)
const API_URL = 'http://147.50.254.108:3000/api';

//  สร้าง Base URL อัตโนมัติ (ตัด /api ออก) เพื่อเอาไปแปะหน้าชื่อรูป
const BASE_URL = 'http://147.50.254.108:3000';

export const MySQLService = {
  // --- ใบงาน ---
  getAll: async () => {
    const res = await axios.get(`${API_URL}/worksheets`);
    
    return res.data.map(item => {
        //  สูตรวิเศษ: จัดการเติมชื่อเว็บให้รูปภาพ
        let img = item.image_url;
        let pdf = item.pdf_url;

        // ถ้าใน DB เป็นลิงก์สั้น (/uploads/...) ให้เติมชื่อเว็บปัจจุบันเข้าไป
        if (img && !img.startsWith('http')) {
            img = `${BASE_URL}${img}`;
        }
        if (pdf && !pdf.startsWith('http')) {
            pdf = `${BASE_URL}${pdf}`;
        }

        return {
            id: item.id,
            title: item.title,
            ageRange: item.age_range,
            category: item.category,
            imageUrl: img,            
            pdfUrl: pdf,              
            createdAt: item.created_at
        };
    });
  },

  add: async (formData) => {
    await axios.post(`${API_URL}/worksheets`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // แก้ไขให้ใช้งานได้จริง
  update: async (id, formData) => {
     // Backend คาดหวัง formData ที่มีไฟล์และ Existing URL
     await axios.put(`${API_URL}/worksheets/${id}`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
     });
  },

  delete: async (id) => {
    await axios.delete(`${API_URL}/worksheets/${id}`);
  },

  // --- หมวดวิชา ---
  getCategories: async () => {
    const res = await axios.get(`${API_URL}/categories`);
    return res.data; // ถ้าต้องแปลง field ก็ทำตรงนี้ได้
  },

  addCategory: async (name, ageGroup) => {
    // ส่ง age_group ไปด้วย (ถ้า Backend ต้องการ)
    await axios.post(`${API_URL}/categories`, { name, age_group: ageGroup });
  },

  // แก้ให้รับ ID แทน Name (เพราะ Backend ลบด้วย ID)
  deleteCategory: async (id) => {
    await axios.delete(`${API_URL}/categories/${id}`);
  }
};