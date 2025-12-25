import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";

// --- Icons ---
import {
  Trash2, Edit, LogOut, Plus, X, Image, FileText,
  Settings, Tag, Loader, Eye, LayoutDashboard,
  Save, UploadCloud, ChevronDown, CheckCircle,
  ArrowUp, ArrowDown // ✅ เพิ่มไอคอนลูกศร
} from "lucide-react";

// --- Services ---
import { API } from "../services/api";
import { AuthService } from "../services/authService";
import { playClickSound } from "../utils/sound";

export default function AdminDashboard() {
  // =========================================
  // 1. Hooks & Config
  // =========================================
  const navigate = useNavigate();
  const aliveRef = useRef(true);

  // =========================================
  // 2. State Management
  // =========================================

  // --- Core Data ---
  const [data, setData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Worksheet Form State ---
  const [isEdit, setIsEdit] = useState(false);
  const [id, setId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    ageRange: [],
    categories: [],
    imageUrl: "",
    pdfUrl: "",
  });

  // --- File Upload State (Worksheet) ---
  const [fileImg, setFileImg] = useState(null);
  const [filePdf, setFilePdf] = useState(null);
  const [previewImgUrl, setPreviewImgUrl] = useState("");

  // --- UI Controls / Modals ---
  const [preview, setPreview] = useState(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);

  // --- Category Management State ---
  const [newCat, setNewCat] = useState("");
  const [targetGroup, setTargetGroup] = useState("2-3");
  const [catIconFiles, setCatIconFiles] = useState({});
  const [catIconPreview, setCatIconPreview] = useState({});
  const [catIconUploading, setCatIconUploading] = useState({});
  
  // ✅ NEW: State สำหรับจัดการลำดับวิชาชั่วคราว
  const [localCats, setLocalCats] = useState([]); 
  const [isReordering, setIsReordering] = useState(false);

  // --- Age Group Management State ---
  const [ageForm, setAgeForm] = useState({
    id: null,
    ageValue: "",
    label: "",
    desc: "",
    color: "green",
    icon: "Baby",
    sortOrder: 0,
  });
  const [ageSaving, setAgeSaving] = useState(false);
  
  // Age Group Uploads (Logo & Cover)
  const [ageLogoFiles, setAgeLogoFiles] = useState({});
  const [ageLogoPreview, setAgeLogoPreview] = useState({});
  const [ageLogoUploading, setAgeLogoUploading] = useState({});
  
  const [ageCateCoverFiles, setAgeCateCoverFiles] = useState({});
  const [ageCateCoverPreview, setAgeCateCoverPreview] = useState({});
  const [ageCateCoverUploading, setAgeCateCoverUploading] = useState({});

  // =========================================
  // 3. Helpers & Utilities
  // =========================================
  const splitCSV = (v) => String(v || "").split(",").map((s) => s.trim()).filter(Boolean);

  const normalizeAge = (ag) => ({
    ...ag,
    id: ag.id,
    ageValue: ag.ageValue ?? ag.age_value ?? "",
    label: ag.label ?? "",
    desc: ag.desc ?? ag.description ?? "",
    color: ag.color ?? "green",
    icon: ag.icon ?? ag.icon_name ?? "Baby",
    sortOrder: ag.sortOrder ?? ag.sort_order ?? 0,
    logoUrl: ag.logoUrl ?? ag.logo_url ?? "",
    cateCoverUrl: ag.cateCoverUrl ?? ag.cate_cover_url ?? "",
  });

  // =========================================
  // 4. Effects (Lifecycle)
  // =========================================
  useEffect(() => {
    aliveRef.current = true;
    loadData();

    return () => {
      aliveRef.current = false;
      if (previewImgUrl) try { URL.revokeObjectURL(previewImgUrl); } catch {}
      Object.values(ageLogoPreview || {}).forEach((u) => { try { if (u) URL.revokeObjectURL(u); } catch {} });
      Object.values(ageCateCoverPreview || {}).forEach((u) => { try { if (u) URL.revokeObjectURL(u); } catch {} });
      Object.values(catIconPreview || {}).forEach((u) => { try { if (u) URL.revokeObjectURL(u); } catch {} });
    };
  }, []);

  // ✅ Effect: เมื่อ allCategories หรือ targetGroup เปลี่ยน ให้โหลดเข้า localCats เพื่อเตรียมจัดลำดับ
  useEffect(() => {
    const filtered = allCategories
      .filter((c) => (c.ageGroup ?? c.age_group) === targetGroup)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)); // เรียงตามลำดับเดิมก่อน
    setLocalCats(filtered);
  }, [allCategories, targetGroup]);

  const loadData = async () => {
    if (!aliveRef.current) return;
    setLoading(true);
    try {
      const [works, cats, ages] = await Promise.all([
        API.getWorksheets(),
        API.getCategories(),
        API.getAgeGroups(),
      ]);

      if (!aliveRef.current) return;

      setData(works || []);
      setAllCategories(cats || []); // API ควรส่ง sortOrder มาด้วย

      const normalizedAges = (ages || []).map(normalizeAge);
      setAgeGroups(normalizedAges);

      if (normalizedAges.length > 0 && !normalizedAges.some((ag) => ag.ageValue === targetGroup)) {
        setTargetGroup(normalizedAges[0].ageValue);
      }
    } catch (error) {
      console.error("Connection Error:", error);
    }
    if (aliveRef.current) setLoading(false);
  };

  // =========================================
  // 5. Derived State
  // =========================================
  const availableCategories = allCategories.filter((c) => {
    const catAge = c.ageGroup ?? c.age_group;
    return form.ageRange.includes(catAge);
  });

  const ageOptionsList = ageGroups.length
    ? ageGroups.map((ag) => ag.ageValue)
    : ["2-3", "3-4", "4-5", "5-6", "เตรียมป1", "เสริมเชาว์", "บัตรคำ", "ตามหน่วย"];

  const ageOptionsDropdown = ageGroups.length ? (
    ageGroups.map((ag) => <option key={ag.id} value={ag.ageValue}>{ag.label}</option>)
  ) : (
    <>
      <option value="2-3">2-3 ปี</option>
      <option value="3-4">3-4 ปี</option>
      <option value="4-5">4-5 ปี</option>
      <option value="5-6">5-6 ปี</option>
      <option value="เตรียมป1">เตรียมขึ้น ป.1</option>
      <option value="เสริมเชาว์">เสริมเชาว์ฯ</option>
      <option value="บัตรคำ">บัตรคำ</option>
      <option value="ตามหน่วย">ใบงานตามหน่วย</option>
    </>
  );

  // =========================================
  // 6. Handlers: Worksheet Form
  // =========================================
  const toggleAge = (age) => {
    playClickSound();
    setForm((prev) => {
      if (prev.ageRange.includes(age)) return { ...prev, ageRange: prev.ageRange.filter((a) => a !== age) };
      return { ...prev, ageRange: [...prev.ageRange, age] };
    });
  };

  const toggleCategory = (catName) => {
    playClickSound();
    setForm((prev) => {
      if (prev.categories.includes(catName)) return { ...prev, categories: prev.categories.filter((c) => c !== catName) };
      return { ...prev, categories: [...prev.categories, catName] };
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "img") {
      if (previewImgUrl) try { URL.revokeObjectURL(previewImgUrl); } catch {}
      setFileImg(file);
      setPreviewImgUrl(URL.createObjectURL(file));
    } else {
      setFilePdf(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClickSound();
    if (!form.title) return alert("กรุณากรอกชื่อใบงาน");
    if (form.ageRange.length === 0) return alert("กรุณาเลือกระดับชั้นอย่างน้อย 1 ระดับ");
    if (form.categories.length === 0) return alert("กรุณาเลือกวิชาอย่างน้อย 1 วิชา");
    if (!isEdit && (!fileImg || !filePdf)) return alert("กรุณาอัปโหลดรูปและ PDF ให้ครบ");

    setLoading(true);
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("ageRange", form.ageRange.join(","));
    formData.append("category", form.categories.join(","));

    if (fileImg) formData.append("image", fileImg);
    if (filePdf) formData.append("pdf", filePdf);

    if (isEdit) {
      formData.append("existingImage", form.imageUrl);
      formData.append("existingPdf", form.pdfUrl);
    }

    try {
      if (isEdit) {
        await API.updateWorksheet(id, formData);
        setIsEdit(false);
      } else {
        await API.addWorksheet(formData);
      }
      resetForm();
      await loadData();
    } catch (error) {
      alert("บันทึกไม่สำเร็จ: " + error.message);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ title: "", ageRange: [], categories: [], imageUrl: "", pdfUrl: "" });
    setFileImg(null);
    setFilePdf(null);
    if (previewImgUrl) try { URL.revokeObjectURL(previewImgUrl); } catch {}
    setPreviewImgUrl("");
  };

  const handleEditClick = (item) => {
    playClickSound();
    setIsEdit(true);
    setId(item.id);
    const ageArray = splitCSV(item.ageRange);
    const catArray = splitCSV(item.category);

    setForm({
      title: item.title,
      ageRange: ageArray,
      categories: catArray,
      imageUrl: item.imageUrl,
      pdfUrl: item.pdfUrl,
    });

    if (previewImgUrl) try { URL.revokeObjectURL(previewImgUrl); } catch {}
    setPreviewImgUrl(item.imageUrl || "");
    setFileImg(null);
    setFilePdf(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (delId) => {
    playClickSound();
    if (confirm("ยืนยันการลบ?")) {
      await API.deleteWorksheet(delId);
      loadData();
    }
  };

  // =========================================
  // 7. Handlers: Category Management (Reorder Logic Added)
  // =========================================
  const handleAddCat = async (e) => {
    e.preventDefault();
    playClickSound();
    if (newCat.trim()) {
      // กำหนด sortOrder ให้ต่อท้ายสุด
      const maxOrder = localCats.length > 0 ? Math.max(...localCats.map(c => c.sortOrder || 0)) : 0;
      await API.addCategory(newCat.trim(), targetGroup, maxOrder + 1);
      setNewCat("");
      loadData();
    }
  };

  const handleDeleteCat = async (catId) => {
    if (!confirm("ลบวิชานี้?")) return;
    setCatIconFiles((prev) => { const next = { ...prev }; delete next[catId]; return next; });
    setCatIconPreview((prev) => {
      const next = { ...prev };
      if (next[catId]) try { URL.revokeObjectURL(next[catId]); } catch {}
      delete next[catId];
      return next;
    });
    setCatIconUploading((prev) => { const next = { ...prev }; delete next[catId]; return next; });

    await API.deleteCategory(catId);
    loadData();
  };

  const handlePickCatIcon = (catId, file) => {
    if (!file) return;
    setCatIconPreview((prev) => {
      if (prev?.[catId]) try { URL.revokeObjectURL(prev[catId]); } catch {}
      return { ...prev, [catId]: URL.createObjectURL(file) };
    });
    setCatIconFiles((prev) => ({ ...prev, [catId]: file }));
  };

  const handleUploadCatIcon = async (cat) => {
    const file = catIconFiles[cat.id];
    if (!file) return alert("กรุณาเลือกไฟล์ไอคอนก่อน");

    setCatIconUploading((prev) => ({ ...prev, [cat.id]: true }));
    try {
      await API.uploadCategoryIcon(cat.id, file);
      await loadData();
      
      setCatIconFiles((prev) => { const next = { ...prev }; delete next[cat.id]; return next; });
      setCatIconPreview((prev) => {
        const next = { ...prev };
        if (next[cat.id]) try { URL.revokeObjectURL(next[cat.id]); } catch {}
        delete next[cat.id];
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("อัปโหลดไอคอนไม่สำเร็จ");
    }
    setCatIconUploading((prev) => ({ ...prev, [cat.id]: false }));
  };

  // ✅ NEW: ฟังก์ชันเลื่อนตำแหน่งวิชา (Local State)
  const moveCategory = (index, direction) => {
    const newCats = [...localCats];
    if (direction === 'up' && index > 0) {
      [newCats[index], newCats[index - 1]] = [newCats[index - 1], newCats[index]];
    } else if (direction === 'down' && index < newCats.length - 1) {
      [newCats[index], newCats[index + 1]] = [newCats[index + 1], newCats[index]];
    }
    setLocalCats(newCats);
  };

  // ✅ NEW: ฟังก์ชันบันทึกลำดับไปยัง Server
  const saveCategoryOrder = async () => {
    setIsReordering(true);
    try {
      // สร้าง payload ที่มี id และ sortOrder ใหม่
      const updates = localCats.map((cat, index) => ({
        id: cat.id,
        sortOrder: index + 1
      }));
      
      // เรียก API (ต้องมี endpoint นี้ที่หลังบ้าน)
      await API.updateCategoryOrder(updates); // สมมติว่ามี function นี้ใน api.js
      alert("บันทึกลำดับเรียบร้อย");
      loadData();
    } catch (error) {
      console.error(error);
      alert("บันทึกลำดับไม่สำเร็จ (ตรวจสอบ API)");
    }
    setIsReordering(false);
  };

  // =========================================
  // 8. Handlers: Age Group Management
  // =========================================
  const handleSaveAgeGroup = async (e) => {
    e.preventDefault();
    playClickSound();
    if (!ageForm.ageValue.trim()) return alert("กรุณาใส่รหัสช่วงอายุ เช่น 2-3");
    if (!ageForm.label.trim()) return alert("กรุณาใส่ชื่อช่วงอายุที่จะแสดง");

    setAgeSaving(true);
    try {
      const payload = {
        ageValue: ageForm.ageValue.trim(),
        label: ageForm.label.trim(),
        desc: ageForm.desc.trim(),
        color: ageForm.color,
        icon: ageForm.icon,
        sortOrder: Number(ageForm.sortOrder) || 0,
      };

      if (ageForm.id) await API.updateAgeGroup(ageForm.id, payload);
      else await API.addAgeGroup(payload);

      const ages = await API.getAgeGroups() || [];
      setAgeGroups(ages.map(normalizeAge));
      
      setAgeForm({
        id: null,
        ageValue: "",
        label: "",
        desc: "",
        color: "green",
        icon: "Baby",
        sortOrder: (ages.length || 0) + 1,
      });
    } catch (err) {
      console.error(err);
      alert("บันทึกช่วงอายุไม่สำเร็จ");
    }
    setAgeSaving(false);
  };

  const handleDeleteAgeGroup = async (ageId) => {
    if (!confirm("ลบหมวดหมู่อายุนี้ทั้งหมดหรือไม่ ?")) return;
    try {
      await API.deleteAgeGroup(ageId);
      const ages = await API.getAgeGroups() || [];
      setAgeGroups(ages.map(normalizeAge));
    } catch (err) {
      console.error(err);
      alert("ลบหมวดหมู่อายุไม่สำเร็จ");
    }
  };

  const handlePickAgeImage = (id, file, setPreview, setFile) => {
    if (!file) return;
    setPreview((prev) => {
      if (prev?.[id]) try { URL.revokeObjectURL(prev[id]); } catch {}
      return { ...prev, [id]: URL.createObjectURL(file) };
    });
    setFile((prev) => ({ ...prev, [id]: file }));
  };

  const handleUploadAgeImage = async (ag, type, fileState, previewState, uploadStateSetter, apiCall) => {
    const file = fileState[ag.id];
    if (!file) return alert(`กรุณาเลือกไฟล์${type}ก่อน`);
    
    uploadStateSetter((prev) => ({ ...prev, [ag.id]: true }));
    try {
      await apiCall(ag.id, file);
      const ages = await API.getAgeGroups() || [];
      setAgeGroups(ages.map(normalizeAge));
    } catch (err) {
      console.error(err);
      alert(`อัปโหลด${type}ไม่สำเร็จ`);
    }
    uploadStateSetter((prev) => ({ ...prev, [ag.id]: false }));
  };

  // =========================================
  // 9. Render
  // =========================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20">
      
      {/* --- Navbar --- */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-14 sm:h-16 flex justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm">
              <LayoutDashboard size={22} />
            </div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
              Admin Console
            </h1>
          </div>

          <div className="flex gap-1.5 sm:gap-2 md:gap-3">
            <button
              onClick={() => {
                playClickSound();
                setShowCatModal(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 text-slate-600 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-xs sm:text-sm shadow-sm"
            >
              <Settings size={16} className="sm:w-[18px] sm:h-[18px] text-indigo-500" />
              <span className="hidden sm:inline">จัดการวิชา</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setShowAgeModal(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold hover:bg-emerald-100 hover:border-emerald-300 transition-all text-xs sm:text-sm shadow-sm"
            >
              <Tag size={16} className="sm:w-[18px] sm:h-[18px] text-emerald-500" />
              <span className="hidden sm:inline">จัดการช่วงอายุ</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                AuthService.logout();
                navigate("/");
              }}
              className="flex items-center gap-1.5 sm:gap-2 bg-rose-50 text-rose-600 border border-rose-100 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold hover:bg-rose-100 transition-all text-xs sm:text-sm shadow-sm"
            >
              <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">ออก</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Layout --- */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mt-4 sm:mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
        
        {/* --- LEFT COLUMN: Form --- */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border border-slate-100 sticky top-20 sm:top-24">
            <h2 className="text-lg font-bold mb-6 flex gap-3 items-center text-slate-700 pb-4 border-b border-slate-100">
              <div className={`p-2 rounded-full ${isEdit ? "bg-orange-100 text-orange-500" : "bg-indigo-100 text-indigo-500"}`}>
                {isEdit ? <Edit size={20} /> : <Plus size={20} />}
              </div>
              {isEdit ? "แก้ไขข้อมูลใบงาน" : "เพิ่มใบงานใหม่ (ทีละใบ)"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title Input */}
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wider">ชื่อใบงาน</label>
                <input
                  type="text"
                  placeholder="ระบุชื่อใบงาน..."
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-medium transition-all"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Age Range Selection */}
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wider">ระดับชั้น (เลือกได้มากกว่า 1)</label>
                <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200">
                  <div className="flex flex-wrap gap-2">
                    {ageOptionsList.map((age) => {
                      const isSelected = form.ageRange.includes(age);
                      return (
                        <button
                          key={age}
                          type="button"
                          onClick={() => {
                            playClickSound();
                            toggleAge(age);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                            isSelected ? "bg-blue-500 text-white border-blue-600 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          {isSelected && <CheckCircle size={12} />}
                          {age}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wider">วิชา (ตามระดับชั้นที่เลือก)</label>
                <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200 min-h-[60px]">
                  {availableCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((cat) => {
                        const isSelected = form.categories.includes(cat.name);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              toggleCategory(cat.name);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                              isSelected
                                ? "bg-indigo-500 text-white border-indigo-600 shadow-md transform scale-105"
                                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                            }`}
                          >
                            {isSelected && <CheckCircle size={12} />}
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-red-500 flex items-center justify-center gap-2 py-2">
                      {form.ageRange.length === 0 ? "กรุณาเลือกระดับชั้นก่อน" : "ยังไม่มีวิชาในชั้นที่เลือก"}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="mt-2">
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wider">รูปภาพปก</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-2xl h-40 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all group overflow-hidden bg-slate-50">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 z-20"
                    onChange={(e) => handleFileChange(e, "img")}
                  />
                  {previewImgUrl ? (
                    <img src={previewImgUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="text-slate-400 group-hover:text-indigo-500 transition-colors flex flex-col items-center">
                      <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:shadow-md transition-all">
                        <Image size={24} className="text-indigo-400" />
                      </div>
                      <p className="text-sm font-bold">คลิกเพื่อเลือกรูปภาพ</p>
                      <p className="text-xs">PNG, JPG (แนะนำแนวตั้ง)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wider">ไฟล์ PDF</label>
                <div className={`relative border-2 border-slate-200 rounded-xl p-3 flex items-center justify-center transition-all hover:border-indigo-400 hover:shadow-sm ${
                  filePdf || (isEdit && form.pdfUrl) ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-slate-50"
                }`}>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="absolute inset-0 opacity-0 z-20"
                    onChange={(e) => handleFileChange(e, "pdf")}
                  />
                  <FileText size={20} className="mr-2" />
                  <span className="text-sm font-bold truncate max-w-[200px]">
                    {filePdf ? filePdf.name : (isEdit && form.pdfUrl ? "มีไฟล์เดิมแล้ว (คลิกเพื่อเปลี่ยน)" : "คลิกเพื่อเลือกไฟล์ PDF")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => { setIsEdit(false); resetForm(); }}
                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    ยกเลิก
                  </button>
                )}
                <button
                  disabled={loading}
                  className={`flex-1 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2 ${
                    isEdit ? "bg-gradient-to-r from-orange-400 to-pink-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                  } disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {loading ? <Loader className="animate-spin" size={18} /> : (isEdit ? <><Save size={18} /> บันทึกการแก้ไข</> : <><Plus size={18} /> บันทึก</>)}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Content Grid --- */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
              <LayoutDashboard className="text-indigo-500" size={20} />
              รายการใบงานทั้งหมด
              <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md text-sm">{data.length}</span>
            </h2>
          </div>

          {loading && !data.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-[2rem] shadow-sm border border-slate-100">
              <Loader className="animate-spin mb-4 text-indigo-400" size={40} />
              <p className="font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {data.map((d) => {
                const cats = splitCSV(d.category);
                return (
                  <div key={d.id} className="bg-white p-3 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col relative">
                    <div onClick={() => setPreview(d)} className="relative w-full aspect-[3/4] rounded-xl bg-slate-100 overflow-hidden mb-3">
                      <img
                        src={d.imageUrl}
                        alt={d.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300?text=No+Image"; }}
                      />
                      <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <div className="bg-white/90 p-2 rounded-full shadow-sm backdrop-blur-sm">
                          <Eye size={20} className="text-indigo-600" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-600 shadow-sm flex items-center gap-1 border border-indigo-50">
                        <Tag size={10} /> {d.ageRange}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="mb-1.5 flex flex-wrap gap-1">
                        {cats.slice(0, 2).map((cat, idx) => (
                          <span key={idx} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold truncate block max-w-full border border-indigo-100">
                            {cat}
                          </span>
                        ))}
                        {cats.length > 2 && <span className="text-[9px] text-slate-400">+{cats.length - 2}</span>}
                      </div>

                      <h3 className="font-bold text-slate-700 text-sm line-clamp-2 mb-3 leading-tight flex-1" title={d.title}>
                        {d.title}
                      </h3>

                      <div className="flex gap-2 pt-3 border-t border-slate-50 mt-auto">
                        <button onClick={() => {
                          playClickSound();
                          handleEditClick(d);
                        }} className="flex-1 py-1.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-orange-50 hover:text-orange-500 transition-all flex justify-center items-center border border-slate-100 hover:border-orange-200">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => {
                          playClickSound();
                          handleDelete(d.id);
                        }} className="flex-1 py-1.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-all flex justify-center items-center border border-slate-100 hover:border-rose-200">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && data.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400">
              <Image className="mx-auto mb-4 text-slate-300" size={60} />
              <p className="text-lg font-bold">ยังไม่มีข้อมูลในระบบ</p>
              <p className="text-sm">เริ่มสร้างใบงานใหม่ได้ที่ฟอร์มฝั่งซ้ายมือ</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* 10. Modals Section */}
      {/* ========================================= */}

      {/* --- Category Modal --- */}
      <AnimatePresence>
        {showCatModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl w-full max-w-md shadow-2xl relative border border-white/50 max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowCatModal(false)} className="absolute top-5 right-5 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-all text-slate-500">
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="bg-indigo-100 p-2 rounded-xl text-indigo-500"><Settings size={24} /></div>
                จัดการรายวิชา
              </h2>

              <div className="mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-wider">เลือกกลุ่มที่ต้องการจัดการ</label>
                <div className="relative">
                  <select
                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-bold text-slate-700 appearance-none transition-all"
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                  >
                    {ageOptionsDropdown}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <form onSubmit={handleAddCat} className="flex gap-3 mb-6">
                <input
                  type="text"
                  placeholder={`ชื่อวิชาใหม่ของ ${targetGroup}...`}
                  className="flex-1 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-medium"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 rounded-xl font-bold hover:bg-indigo-700 shadow-md flex items-center justify-center transition-all transform hover:scale-105">
                  <Plus size={20} />
                </button>
              </form>

              {/* ✅ NEW: Category List with Reorder Buttons */}
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {localCats.length > 0 ? (
                  localCats.map((cat, index) => {
                    const iconUrl = cat.iconUrl || cat.icon_url || "";
                    return (
                      <div key={cat.id} className="p-3 bg-white rounded-xl border border-slate-100 text-sm hover:shadow-md transition-all group flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {catIconPreview[cat.id] || iconUrl ? (
                                <img src={catIconPreview[cat.id] || iconUrl} alt={cat.name} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold">ICON</span>
                              )}
                            </div>
                            <span className="font-bold text-slate-700 flex items-center gap-2 truncate">
                              <Tag size={16} className="text-indigo-400 group-hover:text-indigo-600" /> {cat.name}
                            </span>
                          </div>
                          
                          {/* ปุ่มลบ และเลื่อนลำดับ */}
                          <div className="flex items-center gap-1">
                            <div className="flex flex-col">
                                <button type="button" disabled={index === 0} onClick={() => moveCategory(index, 'up')} className="text-slate-400 hover:text-indigo-500 disabled:opacity-30">
                                    <ArrowUp size={16} />
                                </button>
                                <button type="button" disabled={index === localCats.length - 1} onClick={() => moveCategory(index, 'down')} className="text-slate-400 hover:text-indigo-500 disabled:opacity-30">
                                    <ArrowDown size={16} />
                                </button>
                            </div>
                            <button onClick={() => handleDeleteCat(cat.id)} className="text-slate-400 hover:text-red-500 bg-slate-50 p-2 rounded-lg transition-all hover:bg-red-50 shrink-0 ml-2">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-50">
                          <label className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100">
                            เลือกไอคอน
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePickCatIcon(cat.id, e.target.files?.[0])} />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleUploadCatIcon(cat)}
                            disabled={!catIconFiles[cat.id] || catIconUploading[cat.id]}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {catIconUploading[cat.id] ? "กำลังอัปโหลด..." : "อัปโหลดไอคอน"}
                          </button>
                          {catIconFiles[cat.id] && <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{catIconFiles[cat.id].name}</span>}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Tag className="mx-auto mb-2 text-slate-300" size={32} />
                    <p className="font-medium">ยังไม่มีวิชาในกลุ่มนี้</p>
                  </div>
                )}
              </div>

              {/* ✅ NEW: Save Order Button */}
              {localCats.length > 1 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <button 
                        onClick={saveCategoryOrder} 
                        disabled={isReordering}
                        className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isReordering ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                        บันทึกลำดับวิชา
                    </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Age Group Modal --- */}
      <AnimatePresence>
        {showAgeModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl w-full max-w-lg shadow-2xl relative border border-white/50 max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowAgeModal(false)} className="absolute top-5 right-5 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-all text-slate-500">
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-500"><Tag size={24} /></div>
                จัดการหมวดหมู่อายุ
              </h2>

              <div className="mb-5 max-h-48 overflow-y-auto space-y-2 pr-1">
                {ageGroups.map((ag) => (
                  <div key={ag.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 gap-3">
                    <div className="min-w-0 flex items-start gap-3">
                      <div className="flex gap-2 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                          {ageLogoPreview[ag.id] || ag.logoUrl ? (
                            <img src={ageLogoPreview[ag.id] || ag.logoUrl} alt={ag.label} className="w-full h-full object-contain" />
                          ) : <span className="text-[10px] text-slate-400 font-bold">LOGO</span>}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                          {ageCateCoverPreview[ag.id] || ag.cateCoverUrl ? (
                            <img src={ageCateCoverPreview[ag.id] || ag.cateCoverUrl} alt={`${ag.label} cover`} className="w-full h-full object-cover" />
                          ) : <span className="text-[10px] text-slate-400 font-bold">CATE</span>}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-slate-700 text-sm truncate">{ag.ageValue} : {ag.label}</p>
                        {ag.desc && <p className="text-[11px] text-slate-500 truncate">{ag.desc}</p>}
                        
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <label className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100">
                            เลือกโลโก้
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePickAgeImage(ag.id, e.target.files?.[0], setAgeLogoPreview, setAgeLogoFiles)} />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleUploadAgeImage(ag, "โลโก้", ageLogoFiles, ageLogoPreview, setAgeLogoUploading, API.uploadAgeGroupLogo)}
                            disabled={!ageLogoFiles[ag.id] || ageLogoUploading[ag.id]}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {ageLogoUploading[ag.id] ? "..." : "อัปโหลดโลโก้"}
                          </button>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <label className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100">
                            เลือกปก Cate
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePickAgeImage(ag.id, e.target.files?.[0], setAgeCateCoverPreview, setAgeCateCoverFiles)} />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleUploadAgeImage(ag, "ปก", ageCateCoverFiles, ageCateCoverPreview, setAgeCateCoverUploading, API.uploadAgeGroupCateCover)}
                            disabled={!ageCateCoverFiles[ag.id] || ageCateCoverUploading[ag.id]}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {ageCateCoverUploading[ag.id] ? "..." : "อัปโหลดปก"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAgeForm({ ...ag, sortOrder: ag.sortOrder ?? 0 })}
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-emerald-50 hover:border-emerald-200"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAgeGroup(ag.id)}
                        className="px-2 py-1 text-xs bg-rose-50 border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-100"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
                {ageGroups.length === 0 && <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-sm">ยังไม่มีหมวดหมู่อายุในระบบ</div>}
              </div>

              <form onSubmit={handleSaveAgeGroup} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">รหัสช่วงอายุ (age_value)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                      placeholder="เช่น 2-3"
                      value={ageForm.ageValue}
                      onChange={(e) => setAgeForm((prev) => ({ ...prev, ageValue: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">ชื่อที่แสดง (label)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                      placeholder="เช่น เด็กอายุ 2-3 ปี"
                      value={ageForm.label}
                      onChange={(e) => setAgeForm((prev) => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">คำอธิบายสั้น ๆ</label>
                  <textarea
                    className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                    rows={2}
                    value={ageForm.desc}
                    onChange={(e) => setAgeForm((prev) => ({ ...prev, desc: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">สี (color)</label>
                    <select
                      className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm"
                      value={ageForm.color}
                      onChange={(e) => setAgeForm((prev) => ({ ...prev, color: e.target.value }))}
                    >
                      <option value="green">เขียว</option>
                      <option value="blue">ฟ้า</option>
                      <option value="pink">ชมพู</option>
                      <option value="purple">ม่วง</option>
                      <option value="yellow">เหลือง</option>
                      <option value="red">แดง</option>
                      <option value="teal">เขียวอมฟ้า</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">ลำดับแสดง</label>
                    <input
                      type="number"
                      className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm"
                      value={ageForm.sortOrder}
                      onChange={(e) => setAgeForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value || "0", 10) }))}
                    />
                  </div>
                </div>
                <button type="submit" disabled={ageSaving} className="w-full mt-1 bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-60">
                  {ageForm.id ? "บันทึกการแก้ไขช่วงอายุ" : "เพิ่มช่วงอายุใหม่"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* --- Preview Modal --- */}
      <AnimatePresence>
        {preview && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-2 rounded-[2.5rem] max-w-sm w-full relative shadow-2xl"
            >
              <button onClick={() => setPreview(null)} className="absolute -top-4 -right-4 bg-white text-slate-400 hover:text-red-500 w-11 h-11 flex items-center justify-center rounded-full shadow-lg transition-all hover:rotate-90 z-20 border-4 border-slate-50">
                <X size={22} strokeWidth={2.5} />
              </button>
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-inner relative overflow-hidden">
                <div className="text-center mb-6 mt-2">
                  <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-3 border border-indigo-100 shadow-sm">
                    สำหรับน้อง {preview.ageRange}
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 leading-tight px-2 font-sans">{preview.title}</h3>
                </div>
                <div className="relative w-48 mx-auto aspect-[3/4] bg-slate-100 rounded-2xl shadow-xl border-4 border-white mb-8 overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-300">
                  <img src={preview.imageUrl} alt={preview.title} className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-indigo-200 mb-6 flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                    <QRCode value={preview.pdfUrl || "#"} size={54} fgColor="#334155" bgColor="transparent" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Scan QR Code</p>
                    <p className="text-indigo-600 font-bold text-sm">เพื่อดาวน์โหลดไฟล์ PDF</p>
                  </div>
                </div>
                <a href={preview.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm group">
                  <UploadCloud size={20} className="group-hover:animate-bounce" /> เปิดไฟล์ PDF
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}