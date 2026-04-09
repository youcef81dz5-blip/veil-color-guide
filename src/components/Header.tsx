import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Sun, Moon, Globe } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@supabase/supabase-js";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-14 sm:h-16 px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0" onClick={() => navigate("/")}>
            <img src={logoImg} alt="تنسيقة" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-cover" />
            <span className="text-base sm:text-xl font-bold font-['Playfair_Display']">
              {t("app.name")}
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              {t("nav.outfitBuilder")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/colors")}>
              {t("nav.hijabColors")}
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 sm:h-9 sm:w-9">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map(l => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={lang === l.code ? "bg-accent/10 font-bold" : ""}
                >
                  <span className="mr-2">{l.flag}</span>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.user_metadata?.full_name || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
                <LogOut className="h-4 w-4 ml-1" />
                <span className="hidden sm:inline">{t("nav.logout")}</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
                {t("nav.login")}
              </Button>
              <Button size="sm" className="h-8 px-2 sm:px-3 text-xs sm:text-sm bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/auth")}>
                {t("nav.signup")}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
