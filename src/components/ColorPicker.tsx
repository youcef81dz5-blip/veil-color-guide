import { useState } from "react";
import { Check, Pipette } from "lucide-react";
import { Input } from "@/components/ui/input";

const PRESET_COLORS = [
  // الأساسيات
  { name: "أسود", hex: "#1a1a1a" },
  { name: "أبيض", hex: "#f5f5f0" },
  { name: "رمادي فاتح", hex: "#b0b3b8" },
  { name: "رمادي داكن", hex: "#4a4d52" },
  // الأزرق
  { name: "كحلي", hex: "#1e3a5f" },
  { name: "أزرق ملكي", hex: "#2851a3" },
  { name: "أزرق سماوي", hex: "#6ca0dc" },
  { name: "أزرق فاتح", hex: "#a8d8ea" },
  // الأخضر
  { name: "زيتي", hex: "#4a6741" },
  { name: "أخضر زمردي", hex: "#046a38" },
  { name: "أخضر نعناعي", hex: "#98d4a2" },
  { name: "أخضر غامق", hex: "#2d4a22" },
  // البني والبيج
  { name: "بيج", hex: "#d4b896" },
  { name: "بني", hex: "#6b4226" },
  { name: "كاميل", hex: "#c19a6b" },
  { name: "شوكولا", hex: "#3e2723" },
  // الأحمر والوردي
  { name: "خمري", hex: "#722f37" },
  { name: "أحمر", hex: "#c0392b" },
  { name: "زهري", hex: "#c97b84" },
  { name: "فوشي", hex: "#c71585" },
  // البنفسجي
  { name: "بنفسجي", hex: "#6a1b9a" },
  { name: "لافندر", hex: "#b39ddb" },
  { name: "موف", hex: "#8e4585" },
  { name: "بنفسجي غامق", hex: "#311b92" },
  // البرتقالي والأصفر
  { name: "برتقالي محروق", hex: "#cc5500" },
  { name: "خردلي", hex: "#c7a938" },
  { name: "مشمشي", hex: "#f4a460" },
  { name: "ذهبي", hex: "#d4a017" },
  // التيل
  { name: "تيل", hex: "#2e8b8b" },
  { name: "تركواز", hex: "#40e0d0" },
  { name: "بترولي", hex: "#1a5276" },
  { name: "سيليست", hex: "#b2dfdb" },
];

interface ColorPickerProps {
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
}

const ColorPicker = ({ selectedColor, onColorSelect }: ColorPickerProps) => {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">اختاري لون القطعة</h3>
      <p className="text-sm text-muted-foreground">اختاري لون الملابس الأساسية التي تريدين تنسيقها</p>
      <div className="grid grid-cols-4 gap-2.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.hex}
            onClick={() => onColorSelect(color.hex)}
            className="group flex flex-col items-center gap-1"
          >
            <div
              className={`w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                ${selectedColor === color.hex ? "border-accent scale-110 shadow-lg" : "border-border hover:border-muted-foreground hover:scale-105"}`}
              style={{ backgroundColor: color.hex }}
            >
              {selectedColor === color.hex && (
                <Check className="h-4 w-4 drop-shadow-md" style={{ color: isLight(color.hex) ? "#333" : "#fff" }} />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
              {color.name}
            </span>
          </button>
        ))}
      </div>

      {/* Custom color picker */}
      <div className="pt-2 border-t border-border">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pipette className="h-4 w-4" />
          لون مخصص
        </button>
        {showCustom && (
          <div className="flex items-center gap-3 mt-3">
            <input
              type="color"
              value={selectedColor || "#6ca0dc"}
              onChange={(e) => onColorSelect(e.target.value)}
              className="w-10 h-10 rounded-full border-2 border-border cursor-pointer"
            />
            <Input
              value={selectedColor || ""}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onColorSelect(v);
              }}
              placeholder="#hex"
              className="w-28 text-sm font-mono"
              dir="ltr"
            />
            {selectedColor && (
              <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: selectedColor }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

export default ColorPicker;
