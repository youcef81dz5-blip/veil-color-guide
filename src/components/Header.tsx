import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-accent" />
          <span className="text-xl font-bold font-['Playfair_Display']">
            Hijab Color Harmony
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            تسجيل الدخول
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            إنشاء حساب
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
