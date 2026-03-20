import { useState, useEffect } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Suggestion {
  hijabColor: string;
  hijabHex: string;
  imageUrl: string | null;
  description: string;
}

interface SuggestionCardProps {
  showSuggestions: boolean;
  outfitColor: string | null;
  skinTone: string | null;
}

const MATCHING_ITEMS = [
  { name: "وشاح خردلي", color: "#c7a93c", type: "وشاح" },
  { name: "حجاب تيل", color: "#2e8b8b", type: "حجاب" },
  { name: "بلوزة بيج", color: "#d4b896", type: "بلوزة" },
  { name: "تنورة زيتي", color: "#4a6741", type: "تنورة" },
  { name: "حقيبة برتقالية", color: "#cc5500", type: "حقيبة" },
];

const SuggestionCard = ({ showSuggestions, outfitColor, skinTone }: SuggestionCardProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateImages = async () => {
    if (!outfitColor || !skinTone) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-hijab-image",
        {
          body: { outfitColor, skinTone },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        if (data.error === "rate_limited") {
          toast.error("تم تجاوز الحد المسموح، حاولي مرة أخرى لاحقاً");
        } else if (data.error === "payment_required") {
          toast.error("يرجى إضافة رصيد لحسابك");
        }
        throw new Error(data.error);
      }

      setSuggestions(data.suggestions || []);
      setHasGenerated(true);
    } catch (err) {
      console.error("Error generating images:", err);
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate when showSuggestions becomes true
  useEffect(() => {
    if (showSuggestions && !hasGenerated && !loading) {
      generateImages();
    }
  }, [showSuggestions]);

  if (!showSuggestions) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
          <span className="text-4xl">✨</span>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3 font-['Playfair_Display']">
          اقتراحات التنسيق
        </h3>
        <p className="text-muted-foreground max-w-md">
          اختاري لون القطعة ولون بشرتك لتحصلي على اقتراحات ألوان متناسقة تناسبك
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2 font-['Playfair_Display']">
            جاري توليد الاقتراحات...
          </h3>
          <p className="text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            الذكاء الاصطناعي يعمل على إنشاء صور مخصصة لك
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="w-full h-72 rounded-xl" />
          <Skeleton className="w-full h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">حدث خطأ</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => { setHasGenerated(false); setError(null); }} variant="outline">
          <RefreshCw className="ml-2 h-4 w-4" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2 font-['Playfair_Display']">
            اقتراحات التنسيق بالذكاء الاصطناعي
          </h3>
          <p className="text-muted-foreground">ألوان حجاب مقترحة تتناسب مع اختياراتك</p>
        </div>
        <Button
          onClick={() => { setHasGenerated(false); }}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="ml-2 h-4 w-4" />
          توليد جديد
        </Button>
      </div>

      {/* AI Generated Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl border border-border bg-card"
          >
            {suggestion.imageUrl ? (
              <img
                src={suggestion.imageUrl}
                alt={suggestion.description}
                className="w-full h-72 object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-72 bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">لم يتم توليد الصورة</p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full border border-primary-foreground/50"
                  style={{ backgroundColor: suggestion.hijabHex }}
                />
                <span className="text-primary-foreground font-semibold">
                  حجاب {suggestion.hijabColor}
                </span>
              </div>
              <p className="text-primary-foreground/80 text-sm">{suggestion.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Matching Items */}
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-4">قطع أخرى متناسقة</h4>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {MATCHING_ITEMS.map((item) => (
            <div
              key={item.name}
              className="flex-shrink-0 w-28 flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div
                className="w-16 h-16 rounded-lg"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-medium text-foreground text-center">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;
