import { cn } from "@/lib/utils";

export interface GarmentType {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
}

const GARMENT_TYPES: GarmentType[] = [
  { id: "abaya", name: "عباءة", nameEn: "abaya", icon: "🧕", description: "عباءة أنيقة فضفاضة" },
  { id: "jellaba", name: "جلابة مغربية", nameEn: "Moroccan jellaba with hood", icon: "👗", description: "جلابة تقليدية بقلنسوة" },
  { id: "kaftan", name: "قفطان", nameEn: "elegant kaftan dress", icon: "✨", description: "قفطان مطرز فاخر" },
  { id: "blazer", name: "بليزر", nameEn: "blazer/jacket outfit", icon: "🧥", description: "بليزر عصري أنيق" },
  { id: "tunic", name: "تونيك", nameEn: "long tunic top", icon: "👚", description: "تونيك طويل مريح" },
  { id: "kimono", name: "كيمونو", nameEn: "kimono-style open cardigan", icon: "🎎", description: "كيمونو مفتوح أنيق" },
  { id: "jilbab", name: "جلباب", nameEn: "jilbab long modest dress", icon: "👘", description: "جلباب ساتر طويل" },
  { id: "salwar", name: "سلوار كميز", nameEn: "salwar kameez traditional outfit", icon: "🌸", description: "طقم سلوار كميز" },
];

interface GarmentTypeSelectorProps {
  selectedType: string | null;
  onTypeSelect: (type: string) => void;
}

const GarmentTypeSelector = ({ selectedType, onTypeSelect }: GarmentTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {GARMENT_TYPES.map((garment) => (
        <button
          key={garment.id}
          onClick={() => onTypeSelect(garment.id)}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 text-center",
            selectedType === garment.id
              ? "border-primary bg-primary/10 shadow-md scale-[1.02]"
              : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50"
          )}
        >
          <span className="text-2xl">{garment.icon}</span>
          <span className="text-sm font-semibold text-foreground">{garment.name}</span>
          <span className="text-[10px] text-muted-foreground leading-tight">{garment.description}</span>
        </button>
      ))}
    </div>
  );
};

export { GARMENT_TYPES };
export default GarmentTypeSelector;
