import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Palette, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

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
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Palette className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold font-['Playfair_Display']">
              Hijab Color Harmony
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              منسق الإطلالة
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/colors")}>
              تنسيق الحجاب
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.user_metadata?.full_name || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-1" />
                خروج
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                تسجيل الدخول
              </Button>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/auth")}>
                إنشاء حساب
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
