import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Sparkles, KeyRound, CheckCircle2, AlertCircle, Loader2, Gift, Copy } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OnboardingForm from "@/components/OnboardingForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { grantWelcomeOffer, WELCOME_COUPON_CODE } from "@/lib/welcomeOffer";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSignupOffer, setShowSignupOffer] = useState(searchParams.get("offer") === "welcome10");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resetSteps, setResetSteps] = useState([
    { label: "Validating email format", status: "idle" as "idle" | "loading" | "success" | "error" },
    { label: "Initializing Auth request", status: "idle" as "idle" | "loading" | "success" | "error" },
    { label: "Generating secure token", status: "idle" as "idle" | "loading" | "success" | "error" },
    { label: "Delivering reset link", status: "idle" as "idle" | "loading" | "success" | "error" },
  ]);
  const [showProgress, setShowProgress] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const { user, loading: authLoading, isOnboarded, signIn, signUp, checkOnboardingStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !user || showOnboarding) return;

    if (isOnboarded === false) {
      setShowOnboarding(true);
      return;
    }

    if (isOnboarded === true) {
      navigate("/profile");
    }
  }, [authLoading, user, isOnboarded, showOnboarding, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error, session } = await signIn(email, password);

        if (error) {
          toast.error(error instanceof Error ? error.message : String(error));
        } else {
          toast.success("Welcome back!");

          const onboarded = session?.access_token
            ? await checkOnboardingStatus(session.access_token)
            : false;

          if (onboarded) {
            navigate("/profile");
          } else {
            setShowOnboarding(true);
          }
        }
      } else {
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        const { error, session } = await signUp(email, password);

        if (error) {
          toast.error(error instanceof Error ? error.message : String(error));
        } else {
          grantWelcomeOffer(session?.user?.id);
          setShowSignupOffer(true);
          if (session?.access_token) {
            toast.success("Account created! Your 10% welcome discount is ready.");
            const onboarded = await checkOnboardingStatus(session.access_token);
            setShowOnboarding(!onboarded);
            if (onboarded) {
              navigate("/profile");
            }
          } else {
            toast.success(
              "Account created. Verify email, then sign in to use your 10% off."
            );
            setIsLogin(true);
            setPassword("");
          }
        }
      }
    } catch {
      toast.error("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyWelcomeCode = async () => {
    try {
      await navigator.clipboard.writeText(WELCOME_COUPON_CODE);
      toast.success("Coupon code copied");
    } catch {
      toast.info(`Use coupon code ${WELCOME_COUPON_CODE}`);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error("Enter your email");
      return;
    }

    if (!validateEmail(forgotEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    setLoading(true);
    setShowProgress(true);
    
    const steps: { label: string; status: "idle" | "loading" | "success" | "error" }[] = [
      { label: "Validating email format", status: "loading" },
      { label: "Initializing Auth request", status: "idle" },
      { label: "Generating secure token", status: "idle" },
      { label: "Delivering reset link", status: "idle" },
    ];
    setResetSteps(steps);

    try {
      await delay(600);
      steps[0].status = "success";
      steps[1].status = "loading";
      setResetSteps([...steps]);

      const apiPromise = supabase.auth.resetPasswordForEmail(
        forgotEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      await delay(600);
      steps[1].status = "success";
      steps[2].status = "loading";
      setResetSteps([...steps]);

      await delay(600);
      steps[2].status = "success";
      steps[3].status = "loading";
      setResetSteps([...steps]);

      const { error } = await apiPromise;
      if (error) throw error;

      await delay(500);
      steps[3].status = "success";
      setResetSteps([...steps]);

      await delay(400);
      toast.success("Reset link sent!");
      setShowForgot(false);
      setShowProgress(false);
    } catch (err: any) {
      const errorIndex = steps.findIndex((s) => s.status === "loading" || s.status === "idle");
      if (errorIndex !== -1) {
        steps[errorIndex].status = "error";
      }
      setResetSteps([...steps]);
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      toast.success("Verification code sent to your email!");
      setOtpSent(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Please enter the verification code");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      });
      if (error) throw error;
      if (data.session) {
        toast.success("Welcome!");
        const onboarded = await checkOnboardingStatus(data.session.access_token);
        if (onboarded) {
          navigate("/profile");
        } else {
          setShowOnboarding(true);
        }
      } else {
        toast.error("Failed to verify code. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {showOnboarding && user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]"
          >
            <OnboardingForm
              onComplete={() => {
                setShowOnboarding(false);
                navigate("/profile");
              }}
            />
          </motion.div>
        ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]"
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>

              <CardTitle>
                {showForgot
                  ? "Forgot Password"
                  : isLogin
                  ? "Welcome Back"
                  : "Create Account"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {showForgot ? (
                showProgress ? (
                  <div className="space-y-6 py-4">
                    <div className="text-center mb-2">
                      <p className="text-sm text-muted-foreground">Resetting Password for</p>
                      <p className="font-medium text-foreground text-sm truncate">{forgotEmail}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {resetSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-secondary/20 p-3 rounded-lg border border-border/40">
                          {step.status === "idle" && (
                            <div className="w-5 h-5 rounded-full border-2 border-muted flex-shrink-0" />
                          )}
                          {step.status === "loading" && (
                            <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                          )}
                          {step.status === "success" && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          )}
                          {step.status === "error" && (
                            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                          )}
                          <span className={`text-sm ${
                            step.status === "success" ? "text-muted-foreground line-through decoration-emerald-500/30" : 
                            step.status === "loading" ? "text-foreground font-medium" : 
                            step.status === "error" ? "text-destructive font-medium" : "text-muted-foreground"
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {resetSteps.some(s => s.status === "error") && (
                      <Button
                        type="button"
                        onClick={() => setShowProgress(false)}
                        className="w-full mt-4"
                      >
                        Try Again
                      </Button>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={handleForgotPassword}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={forgotEmail}
                        onChange={(e) =>
                          setForgotEmail(e.target.value)
                        }
                        className="pl-10 pr-10"
                        required
                      />
                      {forgotEmail && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {validateEmail(forgotEmail) ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500/70" />
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading || (forgotEmail !== "" && !validateEmail(forgotEmail))}
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className="text-sm text-primary w-full text-center hover:underline block"
                    >
                      Back to login
                    </button>
                  </form>
                )
              ) : isLogin && loginMethod === "otp" ? (
                otpSent ? (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground mb-2">
                      We sent a verification code to <span className="font-semibold text-foreground">{email}</span>.
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter verification code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="pl-10 tracking-widest text-center font-semibold text-lg"
                        maxLength={8}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                    <div className="flex justify-between items-center text-xs">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-primary hover:underline"
                        disabled={loading}
                      >
                        Resend Code
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode("");
                        }}
                        className="text-muted-foreground hover:underline"
                      >
                        Change Email
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Sending Code..." : "Send Login Code (OTP)"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod("password")}
                      className="text-xs text-primary w-full text-center hover:underline block"
                    >
                      Sign in with password instead
                    </button>
                  </form>
                )
              ) : (
                <>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        className="pl-10"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={
                            showPassword ? "text" : "password"
                          }
                          placeholder="Password"
                          value={password}
                          onChange={(e) =>
                            setPassword(e.target.value)
                          }
                          className="pl-10 pr-10"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {isLogin && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setForgotEmail(email);
                              setShowForgot(true);
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading
                        ? "Please wait..."
                        : isLogin
                        ? "Sign In"
                        : "Sign Up"}
                    </Button>

                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setLoginMethod("otp")}
                        className="text-xs text-primary w-full text-center hover:underline block"
                      >
                        Sign in with email verification code (OTP)
                      </button>
                    )}
                  </form>
                </>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        )}
      </main>

      <Footer />

      <Dialog open={showSignupOffer} onOpenChange={setShowSignupOffer}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-primary/25 bg-card p-0 shadow-[0_24px_70px_-28px_hsl(var(--primary)/0.8)]">
          <div className="bg-[linear-gradient(135deg,hsl(var(--crystal-obsidian)),hsl(var(--primary)),hsl(var(--accent)))] px-6 py-7 text-primary-foreground">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/18">
              <Gift className="h-6 w-6" />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-serif">Welcome Gift</DialogTitle>
              <DialogDescription className="text-primary-foreground/85">
                Your first Crystara order just got sweeter.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="space-y-5 px-6 pb-6 pt-5">
            <div>
              <p className="text-sm text-muted-foreground">Use this code at checkout for</p>
              <p className="mt-1 text-4xl font-bold text-primary">10% OFF</p>
              <p className="text-sm text-muted-foreground">on your first signup order.</p>
            </div>

            <button
              type="button"
              onClick={copyWelcomeCode}
              className="flex w-full items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left transition-colors hover:bg-primary/10"
            >
              <span>
                <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">Coupon Code</span>
                <span className="font-mono text-lg font-bold text-foreground">WELCOME10</span>
              </span>
              <Copy className="h-4 w-4 text-primary" />
            </button>

            <Button className="w-full rounded-full" onClick={() => setShowSignupOffer(false)}>
              Start Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
