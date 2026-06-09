import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") === "recovery") {
      setIsRecovery(true);
    }
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
  }, []);

  // Real-time password criteria validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const satisfiedCount = [hasMinLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length;

  const getStrengthProgress = () => {
    if (!password) return { percentage: 0, label: "", color: "bg-muted" };
    switch (satisfiedCount) {
      case 1:
        return { percentage: 25, label: "Weak ⚠️", color: "bg-rose-500" };
      case 2:
        return { percentage: 50, label: "Fair ⚡", color: "bg-amber-500" };
      case 3:
        return { percentage: 75, label: "Good ✨", color: "bg-blue-500" };
      case 4:
        return { percentage: 100, label: "Strong 💪", color: "bg-emerald-500" };
      default:
        return { percentage: 0, label: "", color: "bg-muted" };
    }
  };

  const strength = getStrengthProgress();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]"
        >
          <Card className="w-full max-w-md bg-card border-border shadow-crystal">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-serif font-bold">
                {isRecovery ? "Set New Password" : "Reset Password"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Enter your new password below</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {password && (
                    <div className="space-y-2 pt-1 px-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Password Strength</span>
                        <span
                          className="font-semibold"
                          style={{
                            color:
                              strength.percentage === 25
                                ? "#f43f5e"
                                : strength.percentage === 50
                                ? "#f59e0b"
                                : strength.percentage === 75
                                ? "#3b82f6"
                                : "#10b981",
                          }}
                        >
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${strength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${strength.percentage}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password requirements checklist */}
                  <div className="space-y-2 pt-1 px-1 bg-secondary/10 p-3 rounded-lg border border-border/40">
                    <p className="text-xs font-semibold text-muted-foreground">Password checklist:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                            hasMinLength
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                              : "border-muted text-muted-foreground"
                          }`}
                        >
                          {hasMinLength ? <Check size={10} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />}
                        </div>
                        <span className={hasMinLength ? "text-emerald-500 font-medium transition-colors" : "text-muted-foreground transition-colors"}>
                          8+ characters
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                            hasUppercase
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                              : "border-muted text-muted-foreground"
                          }`}
                        >
                          {hasUppercase ? <Check size={10} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />}
                        </div>
                        <span className={hasUppercase ? "text-emerald-500 font-medium transition-colors" : "text-muted-foreground transition-colors"}>
                          Uppercase letter
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                            hasNumber
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                              : "border-muted text-muted-foreground"
                          }`}
                        >
                          {hasNumber ? <Check size={10} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />}
                        </div>
                        <span className={hasNumber ? "text-emerald-500 font-medium transition-colors" : "text-muted-foreground transition-colors"}>
                          At least 1 number
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                            hasSpecialChar
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                              : "border-muted text-muted-foreground"
                          }`}
                        >
                          {hasSpecialChar ? <Check size={10} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />}
                        </div>
                        <span className={hasSpecialChar ? "text-emerald-500 font-medium transition-colors" : "text-muted-foreground transition-colors"}>
                          Special character
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    {confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 transition-all">
                        {password === confirmPassword ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <span className="text-[10px] font-bold">!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {confirmPassword && (
                    <div className="text-right px-1">
                      <span className={`text-[10px] font-semibold transition-colors ${password === confirmPassword ? "text-emerald-500" : "text-rose-500"}`}>
                        {password === confirmPassword ? "Passwords match ✨" : "Passwords do not match yet"}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={loading || password.length < 6 || password !== confirmPassword}
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;

