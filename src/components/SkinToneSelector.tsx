import { Check, Pipette, Camera, Upload, X, Video } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SKIN_TONES = [
  { name: "فاتح جداً", hex: "#fde7d0" },
  { name: "فاتح وردي", hex: "#f8d5c2" },
  { name: "فاتح", hex: "#f5d0a9" },
  { name: "فاتح دافئ", hex: "#f0c8a0" },
  { name: "قمحي فاتح", hex: "#e8b88a" },
  { name: "قمحي", hex: "#d4a06a" },
  { name: "قمحي دافئ", hex: "#cc9660" },
  { name: "حنطي فاتح", hex: "#c68e55" },
  { name: "حنطي", hex: "#c08c5a" },
  { name: "زيتوني فاتح", hex: "#b58040" },
  { name: "زيتوني", hex: "#a87844" },
  { name: "متوسط", hex: "#8d6535" },
  { name: "بني فاتح", hex: "#7d5530" },
  { name: "داكن", hex: "#6b4423" },
  { name: "داكن جداً", hex: "#4a2c17" },
  { name: "بني غامق", hex: "#3b1e10" },
];

interface SkinToneSelectorProps {
  selectedTone: string | null;
  onToneSelect: (tone: string) => void;
  userPhoto: string | null;
  onPhotoUpload: (photo: string | null) => void;
}

const SkinToneSelector = ({ selectedTone, onToneSelect, userPhoto, onPhotoUpload }: SkinToneSelectorProps) => {
  const [showCustom, setShowCustom] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const openCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      alert("لم نتمكن من الوصول إلى الكاميرا. يرجى السماح بالوصول أو استخدام رفع الصورة.");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    onPhotoUpload(base64);
    closeCamera();
  }, [onPhotoUpload]);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB max

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      onPhotoUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">حددي لون بشرتك</h3>
      <p className="text-sm text-muted-foreground">هذا يساعدنا في اقتراح ألوان تناسبك أكثر</p>

      {/* Photo Upload Section */}
      <div className="bg-secondary/50 rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">ارفعي صورتك الشخصية</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          سيتم استخدام صورتك لوضع الحجاب عليها مباشرة
        </p>

        {userPhoto ? (
          <div className="relative inline-block">
            <img
              src={userPhoto}
              alt="صورتك"
              className="w-24 h-24 rounded-xl object-cover border-2 border-accent shadow-md"
            />
            <button
              onClick={() => onPhotoUpload(null)}
              className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : isCameraOpen ? (
          <div className="space-y-2">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-xl border-2 border-accent"
              style={{ transform: "scaleX(-1)" }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={capturePhoto} className="flex-1 gap-1">
                <Camera className="h-4 w-4" />
                التقطي الصورة
              </Button>
              <Button size="sm" variant="outline" onClick={closeCamera}>
                إلغاء
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 border-dashed border-2 h-20 flex flex-col gap-1"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">رفع صورة</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openCamera}
              className="flex-1 border-dashed border-2 h-20 flex flex-col gap-1"
            >
              <Video className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">سيلفي</span>
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Gradient preview bar */}
      <div
        className="h-4 rounded-full w-full"
        style={{
          background: "linear-gradient(to left, #fde7d0, #f5d0a9, #d4a06a, #c08c5a, #a87844, #8d6535, #6b4423, #3b1e10)",
        }}
      />

      <div className="grid grid-cols-4 gap-2.5">
        {SKIN_TONES.map((tone) => (
          <button
            key={tone.hex}
            onClick={() => onToneSelect(tone.hex)}
            className="group flex flex-col items-center gap-1"
          >
            <div
              className={`w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                ${selectedTone === tone.hex ? "border-accent scale-110 shadow-lg" : "border-border hover:border-muted-foreground hover:scale-105"}`}
              style={{ backgroundColor: tone.hex }}
            >
              {selectedTone === tone.hex && (
                <Check className="h-4 w-4 drop-shadow-md" style={{ color: isLight(tone.hex) ? "#333" : "#fff" }} />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
              {tone.name}
            </span>
          </button>
        ))}
      </div>

      {/* Custom tone */}
      <div className="pt-2 border-t border-border">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pipette className="h-4 w-4" />
          لون بشرة مخصص
        </button>
        {showCustom && (
          <div className="flex items-center gap-3 mt-3">
            <input
              type="color"
              value={selectedTone || "#d4a06a"}
              onChange={(e) => onToneSelect(e.target.value)}
              className="w-10 h-10 rounded-full border-2 border-border cursor-pointer"
            />
            <Input
              value={selectedTone || ""}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onToneSelect(v);
              }}
              placeholder="#hex"
              className="w-28 text-sm font-mono"
              dir="ltr"
            />
          </div>
        )}
      </div>

      {/* Preview of selected colors */}
      {selectedTone && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">معاينة اللون المختار</p>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-border" style={{ backgroundColor: selectedTone }} />
            <span className="text-xs text-muted-foreground font-mono" dir="ltr">{selectedTone}</span>
          </div>
        </div>
      )}
    </div>
  );
};

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

export default SkinToneSelector;
