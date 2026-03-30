import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AboutDialog = ({ open, onOpenChange }: AboutDialogProps) => {
  const { t, dir } = useI18n();

  const features = [
    { title: t("about.feat1.title"), desc: t("about.feat1.desc") },
    { title: t("about.feat2.title"), desc: t("about.feat2.desc") },
    { title: t("about.feat3.title"), desc: t("about.feat3.desc") },
    { title: t("about.feat4.title"), desc: t("about.feat4.desc") },
    { title: t("about.feat5.title"), desc: t("about.feat5.desc") },
    { title: t("about.feat6.title"), desc: t("about.feat6.desc") },
  ];

  const steps = [
    { num: "1", title: t("about.step1.title"), desc: t("about.step1.desc") },
    { num: "2", title: t("about.step2.title"), desc: t("about.step2.desc") },
    { num: "3", title: t("about.step3.title"), desc: t("about.step3.desc") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold font-['Playfair_Display'] text-center text-foreground">
            {t("about.title")}
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">{t("about.subtitle")}</p>
        </DialogHeader>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {features.map((feat, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <h4 className="font-bold text-foreground text-sm mb-1">{feat.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-foreground font-['Playfair_Display'] mb-4 text-center">
            {t("about.howTitle")}
          </h3>
          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full gradient-warm text-accent-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => onOpenChange(false)}
          className="w-full mt-6 h-12 gradient-warm text-accent-foreground border-0 text-base font-bold"
        >
          {t("about.close")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AboutDialog;
