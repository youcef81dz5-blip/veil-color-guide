import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sparkles, Camera, Upload, X, Loader2, Check, RefreshCw,
  Save, Trash2, FolderOpen, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import AboutDialog from "@/components/AboutDialog";
import type { User } from "@supabase/supabase-js";

// ─── Clothing categories ───
interface ClothingCategory {
  id: string;
  name: string;
  icon: string;
  nameEn: string;
}

const CATEGORIES: ClothingCategory[] = [
  { id: "hijab", name: "حجاب", icon: "🧕", nameEn: "hijab" },
  { id: "top", name: "قميص / بلوزة", icon: "👚", nameEn: "top/blouse" },
  { id: "dress", name: "فستان / جلباب", icon: "👗", nameEn: "dress/jilbab" },
  { id: "abaya", name: "عباءة", icon: "🧕", nameEn: "abaya" },
  { id: "blazer", name: "بليزر / جاكيت", icon: "🧥", nameEn: "blazer/jacket" },
  { id: "pants", name: "بنطلون", icon: "👖", nameEn: "pants/trousers" },
  { id: "skirt", name: "تنورة", icon: "🩳", nameEn: "skirt" },
  { id: "leggings", name: "ليقنز", icon: "🦵", nameEn: "leggings" },
  { id: "shoes", name: "حذاء", icon: "👠", nameEn: "shoes" },
  { id: "bag", name: "حقيبة", icon: "👜", nameEn: "bag/purse" },
  { id: "scarf", name: "وشاح / شال", icon: "🧣", nameEn: "scarf/shawl" },
  { id: "belt", name: "حزام", icon: "⌚", nameEn: "belt" },
];

// ─── Color palette ───
const COLORS = [
  { name: "أسود", hex: "#1a1a1a" },
  { name: "أبيض", hex: "#f5f5f0" },
  { name: "رمادي", hex: "#b0b3b8" },
  { name: "كحلي", hex: "#1e3a5f" },
  { name: "أزرق", hex: "#2851a3" },
  { name: "سماوي", hex: "#6ca0dc" },
  { name: "زيتي", hex: "#4a6741" },
  { name: "أخضر", hex: "#046a38" },
  { name: "نعناعي", hex: "#98d4a2" },
  { name: "بيج", hex: "#d4b896" },
  { name: "بني", hex: "#6b4226" },
  { name: "كاميل", hex: "#c19a6b" },
  { name: "خمري", hex: "#722f37" },
  { name: "أحمر", hex: "#c0392b" },
  { name: "زهري", hex: "#c97b84" },
  { name: "فوشي", hex: "#c71585" },
  { name: "بنفسجي", hex: "#6a1b9a" },
  { name: "لافندر", hex: "#b39ddb" },
  { name: "برتقالي", hex: "#cc5500" },
  { name: "خردلي", hex: "#c7a938" },
  { name: "ذهبي", hex: "#d4a017" },
  { name: "تيل", hex: "#2e8b8b" },
  { name: "تركواز", hex: "#40e0d0" },
  { name: "بترولي", hex: "#1a5276" },
];

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

// ─── Types ───
interface OutfitPiece {
  categoryId: string;
  color: string;
}

interface AISuggestion {
  categoryId: string;
  categoryName: string;
  suggestedColor: string;
  suggestedColorName: string;
  reason: string;
}

const OutfitBuilder = () => {
  const navigate = useNavigate();
  const { t, dir } = useI18n();
  const [showAbout, setShowAbout] = useState(false);
  const [selectedPieces, setSelectedPieces] = useState<OutfitPiece[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [personPhoto, setPersonPhoto] = useState<string | null>(null);
  const [personCameraActive, setPersonCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const personVideoRef = useRef<HTMLVideoElement>(null);
  const personStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const personFileInputRef = useRef<HTMLInputElement>(null);

  // ─── Auth & saved outfits ───
  const [user, setUser] = useState<User | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const [outfitName, setOutfitName] = useState("إطلالتي");
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadSavedOutfits(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadSavedOutfits(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadSavedOutfits = async (userId: string) => {
    const { data } = await supabase
      .from("saved_outfits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setSavedOutfits(data || []);
  };

  const saveOutfit = async () => {
    if (!user) { toast.error("سجلي الدخول أولاً لحفظ الإطلالة"); return; }
    if (selectedPieces.length === 0) { toast.error("اختاري قطعة واحدة على الأقل"); return; }
    setSavingOutfit(true);
    try {
      const { error } = await supabase.from("saved_outfits").insert({
        user_id: user.id,
        name: outfitName || "إطلالتي",
        pieces: selectedPieces as any,
        generated_image: generatedImage,
      });
      if (error) throw error;
      toast.success("تم حفظ الإطلالة بنجاح");
      loadSavedOutfits(user.id);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSavingOutfit(false);
    }
  };

  const deleteOutfit = async (id: string) => {
    const { error } = await supabase.from("saved_outfits").delete().eq("id", id);
    if (error) { toast.error("حدث خطأ"); return; }
    toast.success("تم الحذف");
    if (user) loadSavedOutfits(user.id);
  };

  const loadOutfit = (outfit: any) => {
    setSelectedPieces(outfit.pieces || []);
    setGeneratedImage(outfit.generated_image || null);
    setOutfitName(outfit.name);
    setShowSaved(false);
    toast.success("تم تحميل الإطلالة");
  };

  // ─── Piece management ───
  const getPieceColor = (catId: string) => selectedPieces.find(p => p.categoryId === catId)?.color || null;

  const setPieceColor = (catId: string, color: string) => {
    setSelectedPieces(prev => {
      const existing = prev.find(p => p.categoryId === catId);
      if (existing) return prev.map(p => p.categoryId === catId ? { ...p, color } : p);
      return [...prev, { categoryId: catId, color }];
    });
  };

  const removePiece = (catId: string) => {
    setSelectedPieces(prev => prev.filter(p => p.categoryId !== catId));
    if (activeCategory === catId) setActiveCategory(null);
  };

  // ─── AI suggest missing colors ───
  const getAISuggestions = async () => {
    if (selectedPieces.length === 0) {
      toast.error("اختاري قطعة واحدة على الأقل أولاً");
      return;
    }
    setLoading(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-outfit", {
        body: {
          mode: "suggest",
          pieces: selectedPieces.map(p => ({
            category: CATEGORIES.find(c => c.id === p.categoryId)?.nameEn || p.categoryId,
            categoryAr: CATEGORIES.find(c => c.id === p.categoryId)?.name || p.categoryId,
            color: p.color,
          })),
          allCategories: CATEGORIES.map(c => ({ id: c.id, nameEn: c.nameEn, name: c.name })),
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) {
        if (data.error === "rate_limited") toast.error("تم تجاوز الحد المسموح، حاولي لاحقاً");
        throw new Error(data.error);
      }

      setSuggestions(data?.suggestions || []);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الاقتراحات");
    } finally {
      setLoading(false);
    }
  };

  // ─── Generate outfit image ───
  const generateImage = async () => {
    if (selectedPieces.length === 0) {
      toast.error("اختاري قطعة واحدة على الأقل");
      return;
    }
    setImageLoading(true);
    setGeneratedImage(null);

    try {
      const body: any = {
        mode: "generate",
        pieces: selectedPieces.map(p => ({
          category: CATEGORIES.find(c => c.id === p.categoryId)?.nameEn || p.categoryId,
          categoryAr: CATEGORIES.find(c => c.id === p.categoryId)?.name || p.categoryId,
          color: p.color,
        })),
      };
      if (uploadedPhoto) {
        body.referencePhoto = uploadedPhoto;
      }
      if (personPhoto) {
        body.personPhoto = personPhoto;
      }
      const { data, error } = await supabase.functions.invoke("analyze-outfit", {
        body,
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setGeneratedImage(data?.imageUrl || null);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء توليد الصورة");
    } finally {
      setImageLoading(false);
    }
  };

  // ─── Camera for identifying pieces ───
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      toast.error("لم نتمكن من فتح الكاميرا");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    stopCamera();
    setUploadedPhoto(base64);
    await analyzePhoto(base64);
  };

  // ─── Camera for person selfie ───
  const startPersonCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      personStreamRef.current = stream;
      if (personVideoRef.current) {
        personVideoRef.current.srcObject = stream;
        personVideoRef.current.play();
      }
      setPersonCameraActive(true);
    } catch {
      toast.error("لم نتمكن من فتح الكاميرا");
    }
  };

  const stopPersonCamera = () => {
    personStreamRef.current?.getTracks().forEach(t => t.stop());
    personStreamRef.current = null;
    setPersonCameraActive(false);
  };

  const capturePersonPhoto = () => {
    if (!personVideoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = personVideoRef.current.videoWidth;
    canvas.height = personVideoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(personVideoRef.current, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    stopPersonCamera();
    setPersonPhoto(base64);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setUploadedPhoto(base64);
      analyzePhoto(base64);
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-uploaded
    e.target.value = "";
  };

  const analyzePhoto = async (photo: string) => {
    setAnalyzingPhoto(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-outfit", {
        body: { mode: "analyze", photo },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const detected: OutfitPiece[] = (data?.pieces || []).map((p: any) => ({
        categoryId: p.categoryId,
        color: p.color,
      }));
      if (detected.length > 0) {
        setSelectedPieces(detected);
        toast.success(`تم التعرف على ${detected.length} قطع من الصورة`);
      } else {
        toast.info("لم يتم التعرف على قطع ملابس واضحة");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحليل الصورة");
    } finally {
      setAnalyzingPhoto(false);
    }
  };

  const applySuggestion = (s: AISuggestion) => {
    setPieceColor(s.categoryId, s.suggestedColor);
    toast.success(`تم إضافة ${s.categoryName}`);
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      <AboutDialog open={showAbout} onOpenChange={setShowAbout} />

      <section className="pt-24 pb-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3 font-['Playfair_Display']">
            {t("hero.title")} <span className="text-gradient">{t("hero.titleHighlight")}</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-4">
            {t("hero.subtitle")}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-3 rounded-xl shadow-md"
              onClick={() => navigate("/colors")}
            >
              {t("hero.hijabBtn")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 py-3 rounded-xl shadow-sm border-accent/40 hover:bg-accent/10"
              onClick={() => setShowAbout(true)}
            >
              {t("hero.aboutBtn")}
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left: Piece Selection ─── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Camera / Upload */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Camera className="h-4 w-4 text-accent" />
                {t("camera.title")}
              </h3>
              {cameraActive ? (
                <div className="space-y-2">
                  <video ref={videoRef} className="w-full rounded-xl" style={{ transform: "scaleX(-1)" }} autoPlay muted playsInline />
                  <div className="flex gap-2">
                    <Button onClick={captureAndAnalyze} className="flex-1 gradient-warm text-accent-foreground border-0" size="sm">
                      {t("camera.captureAnalyze")}
                    </Button>
                    <Button onClick={stopCamera} variant="outline" size="sm">{t("camera.cancel")}</Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={startCamera} variant="outline" size="sm" className="flex-1" disabled={analyzingPhoto}>
                    <Camera className="ml-1 h-4 w-4" />
                    {t("camera.capture")}
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="flex-1" disabled={analyzingPhoto}>
                    <Upload className="ml-1 h-4 w-4" />
                    {t("camera.upload")}
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              )}
              {analyzingPhoto && (
                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("camera.analyzing")}
                </div>
              )}
            </div>

            {/* Person Photo (optional - for outfit generation on real person) */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <Upload className="h-4 w-4 text-accent" />
                {t("person.title")}
              </h3>
              <p className="text-[11px] text-muted-foreground mb-3">
                {t("person.desc")}
              </p>
              {personPhoto ? (
                <div className="relative">
                  <img src={personPhoto} alt="صورتك" className="w-full h-40 object-cover rounded-xl" />
                  <button
                    onClick={() => setPersonPhoto(null)}
                    className="absolute top-2 left-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : personCameraActive ? (
                <div className="space-y-2">
                  <video ref={personVideoRef} className="w-full h-40 object-cover rounded-xl bg-black" autoPlay playsInline muted />
                  <div className="flex gap-2">
                    <Button onClick={capturePersonPhoto} size="sm" className="flex-1">
                      <Camera className="ml-1 h-4 w-4" />
                      {t("person.capture")}
                    </Button>
                    <Button onClick={stopPersonCamera} variant="outline" size="sm" className="flex-1">
                      {t("camera.cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={startPersonCamera} variant="outline" size="sm" className="flex-1">
                    <Camera className="ml-1 h-4 w-4" />
                    {t("camera.capture")}
                  </Button>
                  <Button onClick={() => personFileInputRef.current?.click()} variant="outline" size="sm" className="flex-1">
                    <Upload className="ml-1 h-4 w-4" />
                    {t("camera.upload")}
                  </Button>
                </div>
              )}
              <input
                ref={personFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => setPersonPhoto(ev.target?.result as string);
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </div>

            {/* Categories Grid */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-3">{t("categories.title")}</h3>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => {
                  const pieceColor = getPieceColor(cat.id);
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(isActive ? null : cat.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center",
                        isActive
                          ? "border-accent bg-accent/10 shadow-md"
                          : pieceColor
                            ? "border-primary/40 bg-primary/5"
                            : "border-border bg-card hover:border-muted-foreground/40"
                      )}
                    >
                      {pieceColor && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removePiece(cat.id); }}
                          className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-[11px] font-semibold text-foreground leading-tight">{cat.name}</span>
                      {pieceColor && (
                        <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: pieceColor }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Picker for active category */}
            {activeCategory && (
              <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-3">
                  لون {CATEGORIES.find(c => c.id === activeCategory)?.name}
                </h3>
                <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto">
                  {COLORS.map(color => {
                    const isSelected = getPieceColor(activeCategory) === color.hex;
                    return (
                      <button
                        key={color.hex}
                        onClick={() => setPieceColor(activeCategory, color.hex)}
                        className="flex flex-col items-center gap-0.5"
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                            isSelected ? "border-accent scale-110 shadow-lg" : "border-border hover:scale-105"
                          )}
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3" style={{ color: isLight(color.hex) ? "#333" : "#fff" }} />
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground leading-tight">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
                {/* Custom color input */}
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  <input
                    type="color"
                    value={getPieceColor(activeCategory) || "#6ca0dc"}
                    onChange={e => setPieceColor(activeCategory, e.target.value)}
                    className="w-8 h-8 rounded-full border border-border cursor-pointer"
                  />
                  <Input
                    value={getPieceColor(activeCategory) || ""}
                    onChange={e => {
                      if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setPieceColor(activeCategory, e.target.value);
                    }}
                    placeholder="#hex"
                    className="w-24 text-xs font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Selected pieces preview */}
            {selectedPieces.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-3">{t("outfit.title")}</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedPieces.map(p => {
                    const cat = CATEGORIES.find(c => c.id === p.categoryId);
                    return (
                      <div key={p.categoryId} className="flex items-center gap-1.5 bg-secondary/50 rounded-lg px-2 py-1">
                        <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: p.color }} />
                        <span className="text-xs text-foreground">{cat?.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={getAISuggestions}
                disabled={selectedPieces.length === 0 || loading}
                className="w-full h-12 gradient-warm text-accent-foreground border-0"
              >
                {loading ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Sparkles className="ml-2 h-5 w-5" />}
                {t("ai.suggest")}
              </Button>
              <Button
                onClick={generateImage}
                disabled={selectedPieces.length === 0 || imageLoading}
                variant="outline"
                className="w-full h-12"
              >
                {imageLoading ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Camera className="ml-2 h-5 w-5" />}
                توليد صورة الإطلالة
              </Button>
            </div>

            {/* Save Outfit */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Save className="h-4 w-4 text-accent" />
                حفظ الإطلالة
              </h3>
              <Input
                value={outfitName}
                onChange={e => setOutfitName(e.target.value)}
                placeholder="اسم الإطلالة"
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveOutfit}
                  disabled={selectedPieces.length === 0 || savingOutfit}
                  className="flex-1 gradient-navy text-primary-foreground border-0"
                  size="sm"
                >
                  {savingOutfit ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Save className="ml-1 h-4 w-4" />}
                  حفظ
                </Button>
                <Button
                  onClick={() => setShowSaved(!showSaved)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <FolderOpen className="ml-1 h-4 w-4" />
                  إطلالاتي ({savedOutfits.length})
                </Button>
              </div>
            </div>

            {/* Saved Outfits List */}
            {showSaved && savedOutfits.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-2 max-h-[300px] overflow-y-auto">
                <h3 className="text-sm font-bold text-foreground mb-2">إطلالاتي المحفوظة</h3>
                {savedOutfits.map((outfit) => (
                  <div key={outfit.id} className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border hover:border-accent/40 transition-all bg-secondary/20">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadOutfit(outfit)}>
                      <p className="text-sm font-semibold text-foreground truncate">{outfit.name}</p>
                      <div className="flex gap-1 mt-1">
                        {(outfit.pieces as OutfitPiece[])?.slice(0, 6).map((p, i) => (
                          <div key={i} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: p.color }} />
                        ))}
                        {(outfit.pieces as OutfitPiece[])?.length > 6 && (
                          <span className="text-[10px] text-muted-foreground">+{(outfit.pieces as OutfitPiece[]).length - 6}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={(e) => { e.stopPropagation(); deleteOutfit(outfit.id); }}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {showSaved && savedOutfits.length === 0 && (
              <div className="bg-card rounded-2xl border border-border p-4 shadow-sm text-center text-sm text-muted-foreground">
                لا توجد إطلالات محفوظة بعد
              </div>
            )}
          </div>

          {/* ─── Right: Results ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-4 font-['Playfair_Display']">
                  اقتراحات الذكاء الاصطناعي
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-accent/50 transition-all cursor-pointer bg-secondary/30"
                      onClick={() => applySuggestion(s)}
                    >
                      <div
                        className="w-14 h-14 rounded-xl border-2 border-border flex-shrink-0"
                        style={{ backgroundColor: s.suggestedColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{s.categoryName}</p>
                        <p className="text-xs text-accent font-semibold">{s.suggestedColorName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.reason}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="flex-shrink-0 text-accent">
                        أضيفي
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Image */}
            {(imageLoading || generatedImage) && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground font-['Playfair_Display']">
                    صورة الإطلالة
                  </h3>
                  {generatedImage && (
                    <Button onClick={generateImage} variant="outline" size="sm" disabled={imageLoading}>
                      <RefreshCw className="ml-1 h-4 w-4" />
                      توليد جديد
                    </Button>
                  )}
                </div>
                {imageLoading ? (
                  <div className="flex flex-col items-center justify-center h-72 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mb-3" />
                    <p>جاري توليد صورة الإطلالة...</p>
                  </div>
                ) : generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="الإطلالة المولدة"
                    className="w-full max-h-[500px] object-contain rounded-xl"
                  />
                ) : null}
              </div>
            )}

            {/* Empty state */}
            {suggestions.length === 0 && !generatedImage && !imageLoading && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <span className="text-3xl">👗</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 font-['Playfair_Display']">
                  منسق الإطلالة الذكي
                </h3>
                <p className="text-muted-foreground max-w-md">
                  اختاري القطع التي تملكينها وألوانها، ثم اضغطي "اقتراح" ليقترح لك الذكاء الاصطناعي ألوان القطع الناقصة.
                  يمكنك أيضاً التقاط صورة لتحليل ملابسك تلقائياً.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OutfitBuilder;
