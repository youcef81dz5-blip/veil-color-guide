import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول بنجاح!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! تحققي من بريدك الإلكتروني لتأكيد الحساب.");
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ في تسجيل الدخول بجوجل");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl">
      <Helmet>
        <title>تسجيل الدخول | تنسيقة Tansiqua</title>
        <meta name="description" content="سجّلي الدخول أو أنشئي حساباً جديداً في تنسيقة (Tansiqua) لحفظ إطلالاتك واستخدام تنسيق الحجاب بالذكاء الاصطناعي." />
        <link rel="canonical" href="https://veil-color-guide.lovable.app/auth" />
        <meta property="og:title" content="تسجيل الدخول | تنسيقة Tansiqua" />
        <meta property="og:description" content="سجّلي الدخول لحفظ إطلالاتك في تنسيقة." />
        <meta property="og:url" content="https://veil-color-guide.lovable.app/auth" />
      </Helmet>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={logoImg} alt="Tansiqua application logo" className="h-12 w-12 rounded-xl object-cover" />
            <h1 className="text-2xl font-bold font-['Playfair_Display'] text-foreground">
              {isLogin ? "تسجيل الدخول إلى تنسيقة" : "إنشاء حساب في تنسيقة"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isLogin ? "سجلي الدخول للمتابعة" : "أنشئي حساباً جديداً"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
          {/* Google Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full h-12 text-base gap-3 rounded-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            الدخول بحساب جوجل
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="الاسم الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pr-10 h-12 rounded-xl"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-10 h-12 rounded-xl"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 h-12 rounded-xl"
                minLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base gradient-warm text-accent-foreground hover:opacity-90 rounded-xl border-0"
            >
              {loading ? "جارٍ التحميل..." : isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
              <ArrowRight className="mr-2 h-4 w-4" />
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "ليس لديكِ حساب؟" : "لديكِ حساب بالفعل؟"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent font-semibold hover:underline"
            >
              {isLogin ? "إنشاء حساب" : "تسجيل الدخول"}
            </button>
          </p>
        </div>

        {/* Back */}
        <div className="text-center mt-4">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground">
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
