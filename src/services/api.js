import axios from "axios";

const API_URL = "https://app-sheet.mtr4263.com/api";
const BASE_URL = "https://app-sheet.mtr4263.com";

// helper: แปลง /uploads/... -> absolute url
const toAbsoluteUrl = (maybeUrl) => {
  if (!maybeUrl) return "";
  if (typeof maybeUrl !== "string") return "";
  if (maybeUrl.startsWith("http")) return maybeUrl;
  const normalized = maybeUrl.startsWith("/") ? maybeUrl : `/${maybeUrl}`;
  return `${BASE_URL}${normalized}`;
};

export const API = {
  // ==========================================
  //  AGE GROUPS
  // ==========================================
  uploadAgeGroupLogo: async (id, file) => {
    const fd = new FormData();
    fd.append("logo", file);
    const res = await axios.post(`${API_URL}/age-groups/${id}/logo`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const data = res.data || {};
    return { ...data, logoUrl: toAbsoluteUrl(data.logoUrl || data.logo_url) };
  },

  uploadAgeGroupCateCover: async (id, file) => {
    const fd = new FormData();
    fd.append("cover", file);
    const res = await axios.post(`${API_URL}/age-groups/${id}/cate-cover`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const data = res.data || {};
    return { ...data, cateCoverUrl: toAbsoluteUrl(data.cateCoverUrl || data.cate_cover_url) };
  },

  deleteAgeGroupCateCover: async (id) => {
    const res = await axios.delete(`${API_URL}/age-groups/${id}/cate-cover`);
    return res.data;
  },

  getAgeGroups: async () => {
    const res = await axios.get(`${API_URL}/age-groups`);
    return (res.data || []).map((item) => ({
      id: item.id,
      ageValue: item.age_value ?? item.ageValue ?? "",
      label: item.label ?? "",
      desc: item.description ?? item.desc ?? "",
      color: item.color ?? "green",
      icon: item.icon_name ?? item.icon ?? "Baby",
      sortOrder: item.sort_order ?? item.sortOrder ?? 0,
      logoUrl: toAbsoluteUrl(item.logo_url ?? item.logoUrl),
      cateCoverUrl: toAbsoluteUrl(item.cate_cover_url ?? item.cateCoverUrl),
    }));
  },

  getAgeGroupById: async (id) => {
    const res = await axios.get(`${API_URL}/age-groups/${id}`);
    const item = res.data || {};
    return {
      id: item.id,
      ageValue: item.age_value ?? item.ageValue ?? "",
      label: item.label ?? "",
      desc: item.description ?? item.desc ?? "",
      color: item.color ?? "green",
      icon: item.icon_name ?? item.icon ?? "Baby",
      sortOrder: item.sort_order ?? item.sortOrder ?? 0,
      logoUrl: toAbsoluteUrl(item.logo_url ?? item.logoUrl),
      cateCoverUrl: toAbsoluteUrl(item.cate_cover_url ?? item.cateCoverUrl),
    };
  },

  addAgeGroup: async (data) => axios.post(`${API_URL}/age-groups`, data),
  updateAgeGroup: async (id, data) => axios.put(`${API_URL}/age-groups/${id}`, data),
  deleteAgeGroup: async (id) => axios.delete(`${API_URL}/age-groups/${id}`),

  // ==========================================
  //  CATEGORIES
  // ==========================================
  getCategories: async () => {
    const res = await axios.get(`${API_URL}/categories`);
    return (res.data || []).map((c) => ({
      id: c.id,
      name: c.name,
      ageGroup: c.age_group ?? c.ageGroup ?? "",
      sortOrder: c.sort_order ?? c.sortOrder ?? 0,
      iconUrl: toAbsoluteUrl(c.icon_url ?? c.iconUrl), 
    }));
  },

  addCategory: async (name, ageGroup, sortOrder = 0) => {
    await axios.post(`${API_URL}/categories`, {
      name,
      age_group: ageGroup,
      sort_order: sortOrder,
    });
  },

  deleteCategory: async (id) => axios.delete(`${API_URL}/categories/${id}`),

  // ✅ แก้ไขตรงนี้ครับ: เปลี่ยนจาก Mock เป็นเรียก API ของจริง
  updateCategoryOrder: async (updates) => {
    // ยิง Request ไปที่ Backend ที่เราเพิ่งทำเพิ่มใน server.js
    const res = await axios.post(`${API_URL}/categories/reorder`, { updates });
    return res.data;
  },

  uploadCategoryIcon: async (id, file) => {
    const fd = new FormData();
    fd.append("icon", file);
    const res = await axios.post(`${API_URL}/categories/${id}/icon`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const data = res.data || {};
    return { ...data, iconUrl: toAbsoluteUrl(data.iconUrl || data.icon_url) };
  },

  // ==========================================
  //  WORKSHEETS
  // ==========================================
  getWorksheets: async () => {
    const res = await axios.get(`${API_URL}/worksheets`);
    return (res.data || []).map((item) => ({
      id: item.id,
      title: item.title,
      ageRange: item.age_range ?? item.ageRange ?? "",
      category: item.category ?? "",
      imageUrl: toAbsoluteUrl(item.image_url ?? item.imageUrl),
      pdfUrl: toAbsoluteUrl(item.pdf_url ?? item.pdfUrl),
    }));
  },

  addWorksheet: async (formData) =>
    axios.post(`${API_URL}/worksheets`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateWorksheet: async (id, formData) =>
    axios.put(`${API_URL}/worksheets/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteWorksheet: async (id) => axios.delete(`${API_URL}/worksheets/${id}`),
};