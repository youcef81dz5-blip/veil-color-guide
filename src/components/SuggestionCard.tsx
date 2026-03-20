import heroImg1 from "@/assets/hero-suggestion-1.jpg";
import heroImg2 from "@/assets/hero-suggestion-2.jpg";

interface SuggestionCardProps {
  showSuggestions: boolean;
}

const MATCHING_ITEMS = [
  { name: "وشاح خردلي", color: "#c7a93c", type: "وشاح" },
  { name: "حجاب تيل", color: "#2e8b8b", type: "حجاب" },
  { name: "بلوزة بيج", color: "#d4b896", type: "بلوزة" },
  { name: "تنورة زيتي", color: "#4a6741", type: "تنورة" },
  { name: "حقيبة برتقالية", color: "#cc5500", type: "حقيبة" },
];

const SuggestionCard = ({ showSuggestions }: SuggestionCardProps) => {
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

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2 font-['Playfair_Display']">
          اقتراحات التنسيق بالذكاء الاصطناعي
        </h3>
        <p className="text-muted-foreground">ألوان حجاب مقترحة تتناسب مع اختياراتك</p>
      </div>

      {/* Main Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card">
          <img
            src={heroImg1}
            alt="اقتراح حجاب برتقالي محروق"
            className="w-full h-72 object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
            <span className="text-primary-foreground font-semibold">حجاب برتقالي محروق</span>
            <p className="text-primary-foreground/80 text-sm">تنسيق دافئ و أنيق</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card">
          <img
            src={heroImg2}
            alt="اقتراح حجاب تيل"
            className="w-full h-72 object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
            <span className="text-primary-foreground font-semibold">حجاب تيل أخضر</span>
            <p className="text-primary-foreground/80 text-sm">تنسيق عصري و منعش</p>
          </div>
        </div>
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
