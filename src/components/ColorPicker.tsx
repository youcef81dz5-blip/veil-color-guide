import { useState, useRef, useCallback, useEffect } from "react";
import { Check, Pipette } from "lucide-react";
import { Input } from "@/components/ui/input";

const PRESET_COLORS = [
  { name: "أسود", hex: "#1a1a1a" },
  { name: "أبيض", hex: "#f5f5f0" },
  { name: "رمادي فاتح", hex: "#b0b3b8" },
  { name: "رمادي داكن", hex: "#4a4d52" },
  { name: "كحلي", hex: "#1e3a5f" },
  { name: "أزرق ملكي", hex: "#2851a3" },
  { name: "أزرق سماوي", hex: "#6ca0dc" },
  { name: "أزرق فاتح", hex: "#a8d8ea" },
  { name: "زيتي", hex: "#4a6741" },
  { name: "أخضر زمردي", hex: "#046a38" },
  { name: "أخضر نعناعي", hex: "#98d4a2" },
  { name: "أخضر غامق", hex: "#2d4a22" },
  { name: "بيج", hex: "#d4b896" },
  { name: "بني", hex: "#6b4226" },
  { name: "كاميل", hex: "#c19a6b" },
  { name: "شوكولا", hex: "#3e2723" },
  { name: "خمري", hex: "#722f37" },
  { name: "أحمر", hex: "#c0392b" },
  { name: "زهري", hex: "#c97b84" },
  { name: "فوشي", hex: "#c71585" },
  { name: "بنفسجي", hex: "#6a1b9a" },
  { name: "لافندر", hex: "#b39ddb" },
  { name: "موف", hex: "#8e4585" },
  { name: "بنفسجي غامق", hex: "#311b92" },
  { name: "برتقالي محروق", hex: "#cc5500" },
  { name: "خردلي", hex: "#c7a938" },
  { name: "مشمشي", hex: "#f4a460" },
  { name: "ذهبي", hex: "#d4a017" },
  { name: "تيل", hex: "#2e8b8b" },
  { name: "تركواز", hex: "#40e0d0" },
  { name: "بترولي", hex: "#1a5276" },
  { name: "سيليست", hex: "#b2dfdb" },
];

interface ColorPickerProps {
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert Hex to HSL
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return [h, s * 100, l * 100];
}

// Color Wheel Component
const ColorWheel = ({ selectedColor, onColorSelect }: { selectedColor: string | null; onColorSelect: (c: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [handlePos, setHandlePos] = useState<{ x: number; y: number } | null>(null);
  const [lightness, setLightness] = useState(50);
  const size = 220;
  const radius = size / 2;
  const handleRadius = 10;

  // Draw the color wheel
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = radius;
    const cy = radius;

    ctx.clearRect(0, 0, size, size);

    // Draw color wheel using small arcs
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 1) * (Math.PI / 180);
      const endAngle = (angle + 1) * (Math.PI / 180);

      for (let r = 0; r < radius; r += 1) {
        const saturation = (r / radius) * 100;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.strokeStyle = `hsl(${angle}, ${saturation}%, ${lightness}%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Draw border
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
    ctx.strokeStyle = "hsl(var(--border))";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [lightness, radius, size]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Set handle position from selected color
  useEffect(() => {
    if (selectedColor && selectedColor.length === 7) {
      const [h, s, l] = hexToHsl(selectedColor);
      setLightness(Math.round(l));
      const dist = (s / 100) * radius;
      const angleRad = (h * Math.PI) / 180;
      setHandlePos({
        x: radius + dist * Math.cos(angleRad),
        y: radius - dist * Math.sin(angleRad),
      });
    }
  }, []);

  const getColorAtPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = size / rect.width;
    const scaleY = size / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const dx = x - radius;
    const dy = y - radius;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > radius) return;

    let angle = Math.atan2(-dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    const saturation = (dist / radius) * 100;
    const hex = hslToHex(angle, saturation, lightness);

    setHandlePos({ x, y });
    onColorSelect(hex);
  }, [radius, lightness, onColorSelect, size]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    getColorAtPoint(e.clientX, e.clientY);
  }, [getColorAtPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    getColorAtPoint(e.clientX, e.clientY);
  }, [isDragging, getColorAtPoint]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        className="relative cursor-crosshair"
        style={{ width: size, height: size }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-full"
          style={{ width: size, height: size }}
        />
        {/* Handle */}
        {handlePos && (
          <div
            className="absolute pointer-events-none border-2 border-white rounded-full shadow-lg"
            style={{
              width: handleRadius * 2,
              height: handleRadius * 2,
              left: handlePos.x - handleRadius,
              top: handlePos.y - handleRadius,
              backgroundColor: selectedColor || "transparent",
              boxShadow: "0 0 0 2px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.3)",
            }}
          />
        )}
      </div>
      {/* Lightness slider */}
      <div className="w-full max-w-[220px] space-y-1">
        <label className="text-xs text-muted-foreground">السطوع: {lightness}%</label>
        <input
          type="range"
          min={10}
          max={90}
          value={lightness}
          onChange={(e) => {
            const newL = parseInt(e.target.value);
            setLightness(newL);
            if (handlePos) {
              const dx = handlePos.x - radius;
              const dy = handlePos.y - radius;
              let angle = Math.atan2(-dy, dx) * (180 / Math.PI);
              if (angle < 0) angle += 360;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const saturation = (dist / radius) * 100;
              onColorSelect(hslToHex(angle, saturation, newL));
            }
          }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #000, hsl(0,0%,50%), #fff)`,
          }}
        />
      </div>
    </div>
  );
};

const ColorPicker = ({ selectedColor, onColorSelect }: ColorPickerProps) => {
  const [showCustom, setShowCustom] = useState(false);
  const [showWheel, setShowWheel] = useState(false);

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

      {/* Color Wheel */}
      <div className="pt-2 border-t border-border">
        <button
          onClick={() => { setShowWheel(!showWheel); setShowCustom(false); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-4 h-4 rounded-full" style={{
            background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)"
          }} />
          دائرة الألوان
        </button>
        {showWheel && (
          <div className="mt-3 flex flex-col items-center">
            <ColorWheel selectedColor={selectedColor} onColorSelect={onColorSelect} />
            {selectedColor && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: selectedColor }} />
                <span className="text-xs font-mono text-muted-foreground" dir="ltr">{selectedColor}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom hex input */}
      <div className="border-t border-border pt-2">
        <button
          onClick={() => { setShowCustom(!showCustom); setShowWheel(false); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pipette className="h-4 w-4" />
          إدخال كود اللون
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
