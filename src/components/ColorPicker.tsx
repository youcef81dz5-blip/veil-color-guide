import { useState } from "react";
import { Check } from "lucide-react";

const PRESET_COLORS = [
  { name: "كحلي", hex: "#1e3a5f" },
  { name: "أسود", hex: "#1a1a1a" },
  { name: "أبيض", hex: "#f5f5f0" },
  { name: "بيج", hex: "#d4b896" },
  { name: "زيتي", hex: "#4a6741" },
  { name: "بني", hex: "#6b4226" },
  { name: "رمادي", hex: "#7a7d80" },
  { name: "خمري", hex: "#722f37" },
  { name: "تيل", hex: "#2e8b8b" },
  { name: "زهري", hex: "#c97b84" },
  { name: "أزرق سماوي", hex: "#6ca0dc" },
  { name: "برتقالي محروق", hex: "#cc5500" },
];

interface ColorPickerProps {
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
}

const ColorPicker = ({ selectedColor, onColorSelect }: ColorPickerProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">اختاري لون القطعة</h3>
      <p className="text-sm text-muted-foreground">اختاري لون الملابس الأساسية التي تريدين تنسيقها</p>
      <div className="grid grid-cols-4 gap-3">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.hex}
            onClick={() => onColorSelect(color.hex)}
            className="group flex flex-col items-center gap-1.5"
          >
            <div
              className={`w-12 h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                ${selectedColor === color.hex ? "border-accent scale-110 shadow-lg" : "border-border hover:border-muted-foreground hover:scale-105"}`}
              style={{ backgroundColor: color.hex }}
            >
              {selectedColor === color.hex && (
                <Check className="h-5 w-5 text-primary-foreground drop-shadow-md" />
              )}
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {color.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
