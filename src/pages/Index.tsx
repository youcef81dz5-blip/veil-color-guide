import { useState } from "react";
import Header from "@/components/Header";
import ColorPicker from "@/components/ColorPicker";
import SkinToneSelector from "@/components/SkinToneSelector";
import GarmentTypeSelector from "@/components/GarmentTypeSelector";
import SuggestionCard from "@/components/SuggestionCard";
import heroBg from "@/assets/hero-bg.jpg";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGetSuggestions = () => {
    if (selectedColor && selectedTone) {
      setShowSuggestions(false);
      setTimeout(() => setShowSuggestions(true), 50);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 font-['Playfair_Display']">
            تناسق الألوان <span className="text-gradient">للمحجبات</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            اكتشفي الألوان المثالية التي تناسب بشرتك وملابسك باستخدام أداتنا الذكية لتنسيق الألوان
          </p>
        </div>
      </section>

      {/* Main Tool Section */}
      <section className="container mx-auto px-4 pb-20 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Step 1: Garment Type */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full gradient-warm flex items-center justify-center text-sm font-bold text-accent-foreground">
                  ١
                </span>
                <h2 className="text-xl font-bold text-foreground font-['Playfair_Display']">
                  نوع القطعة
                </h2>
              </div>
              <GarmentTypeSelector selectedType={selectedGarment} onTypeSelect={setSelectedGarment} />
            </div>

            {/* Step 2: Color */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full gradient-navy flex items-center justify-center text-sm font-bold text-primary-foreground">
                  ٢
                </span>
                <h2 className="text-xl font-bold text-foreground font-['Playfair_Display']">
                  لون القطعة
                </h2>
              </div>
              <ColorPicker selectedColor={selectedColor} onColorSelect={setSelectedColor} />
            </div>

            {/* Step 3: Skin */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
                  ٣
                </span>
                <h2 className="text-xl font-bold text-foreground font-['Playfair_Display']">
                  لون البشرة والصورة
                </h2>
              </div>
              <SkinToneSelector
                selectedTone={selectedTone}
                onToneSelect={setSelectedTone}
                userPhoto={userPhoto}
                onPhotoUpload={setUserPhoto}
              />
            </div>

            {/* Color Preview */}
            {(selectedColor || selectedTone) && (
              <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-3">معاينة الاختيارات</h3>
                <div className="flex items-center justify-center gap-4">
                  {selectedColor && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-14 h-14 rounded-xl border-2 border-border shadow-sm" style={{ backgroundColor: selectedColor }} />
                      <span className="text-[10px] text-muted-foreground">القطعة</span>
                    </div>
                  )}
                  {selectedTone && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-14 h-14 rounded-full border-2 border-border shadow-sm" style={{ backgroundColor: selectedTone }} />
                      <span className="text-[10px] text-muted-foreground">البشرة</span>
                    </div>
                  )}
                  {userPhoto && (
                    <div className="flex flex-col items-center gap-1">
                      <img src={userPhoto} alt="صورتك" className="w-14 h-14 rounded-full border-2 border-accent shadow-sm object-cover" />
                      <span className="text-[10px] text-muted-foreground">صورتك</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Get Suggestions Button */}
            <Button
              onClick={handleGetSuggestions}
              disabled={!selectedColor || !selectedTone || !selectedGarment}
              className="w-full h-14 text-lg gradient-warm text-accent-foreground hover:opacity-90 disabled:opacity-40 rounded-xl border-0"
            >
              <Sparkles className="ml-2 h-5 w-5" />
              {userPhoto ? "جربي الحجاب على صورتك" : "احصلي على اقتراحات التنسيق"}
            </Button>
          </div>

          {/* Suggestions Panel */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
            <SuggestionCard
              showSuggestions={showSuggestions}
              outfitColor={selectedColor}
              skinTone={selectedTone}
              userPhoto={userPhoto}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
