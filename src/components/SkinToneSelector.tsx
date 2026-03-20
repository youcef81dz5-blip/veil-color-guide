import { Check } from "lucide-react";

const SKIN_TONES = [
  { name: "فاتح جداً", hex: "#fde7d0" },
  { name: "فاتح", hex: "#f5d0a9" },
  { name: "قمحي فاتح", hex: "#e8b88a" },
  { name: "قمحي", hex: "#d4a06a" },
  { name: "حنطي", hex: "#c08c5a" },
  { name: "زيتوني", hex: "#a87844" },
  { name: "متوسط", hex: "#8d6535" },
  { name: "داكن", hex: "#6b4423" },
];

interface SkinToneSelectorProps {
  selectedTone: string | null;
  onToneSelect: (tone: string) => void;
}

const SkinToneSelector = ({ selectedTone, onToneSelect }: SkinToneSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">حددي لون بشرتك</h3>
      <p className="text-sm text-muted-foreground">هذا يساعدنا في اقتراح ألوان تناسبك أكثر</p>
      <div className="grid grid-cols-4 gap-3">
        {SKIN_TONES.map((tone) => (
          <button
            key={tone.hex}
            onClick={() => onToneSelect(tone.hex)}
            className="group flex flex-col items-center gap-1.5"
          >
            <div
              className={`w-12 h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                ${selectedTone === tone.hex ? "border-accent scale-110 shadow-lg" : "border-border hover:border-muted-foreground hover:scale-105"}`}
              style={{ backgroundColor: tone.hex }}
            >
              {selectedTone === tone.hex && (
                <Check className="h-5 w-5 text-foreground drop-shadow-md" />
              )}
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {tone.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SkinToneSelector;
