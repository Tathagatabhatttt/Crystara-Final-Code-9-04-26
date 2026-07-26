import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, MapPin, ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

interface OnboardingFormProps {
    onComplete: () => void;
}

interface FormData {
    name: string;
    phone: string;
    addressStreet: string;
    addressCity: string;
    addressState: string;
    addressPincode: string;
}

const TOTAL_STEPS = 3;

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
    }),
};

const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
    const { session, user, profile, setIsOnboarded } = useAuth();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        phone: "",
        addressStreet: "",
        addressCity: "",
        addressState: "",
        addressPincode: "",
    });

    useEffect(() => {
        const profilePhone =
            typeof profile?.phone === "string"
                ? profile.phone.replace(/\D/g, "").slice(0, 10)
                : "";
        if (!profilePhone) return;
        setFormData((prev) =>
            prev.phone ? prev : { ...prev, phone: profilePhone },
        );
    }, [profile?.phone]);

    const progress = (step / TOTAL_STEPS) * 100;

    const updateField = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        setDirection(1);
        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    };

    const prevStep = () => {
        setDirection(-1);
        setStep((s) => Math.max(s - 1, 1));
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.name.trim().length >= 2;
            case 2:
                return formData.phone.trim().length >= 10;
            case 3:
                return (
                    formData.addressStreet.trim() &&
                    formData.addressCity.trim() &&
                    formData.addressState.trim() &&
                    formData.addressPincode.trim().length >= 6
                );
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        if (!session?.access_token) {
            toast.error("Session expired. Please sign in again.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/onboarding/profile`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        phone: formData.phone.trim(),
                        address_street: formData.addressStreet.trim(),
                        address_city: formData.addressCity.trim(),
                        address_state: formData.addressState.trim(),
                        address_pincode: formData.addressPincode.trim(),
                    }),
                }
            );

            const text = await response.text();
            let data: any = {};
            try {
                if (text) data = JSON.parse(text);
            } catch {
                // non-JSON response
            }

            if (!response.ok) {
                throw new Error(data?.error || `Server error (${response.status})`);
            }

            setIsOnboarded(true);
            toast.success("Welcome to Crystara! ✨");
            onComplete();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Something went wrong";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md bg-card border-border shadow-crystal overflow-hidden">
            <CardHeader className="text-center pb-4">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
                >
                    <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
                <CardTitle className="text-2xl font-serif">
                    Complete Your Profile
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                    Step {step} of {TOTAL_STEPS} — {step === 1 ? "About You" : step === 2 ? "Contact Info" : "Shipping Address"}
                </p>
                <div className="mt-4 px-2">
                    <Progress value={progress} className="h-2" />
                </div>
            </CardHeader>

            <CardContent className="relative min-h-[280px]">
                <AnimatePresence mode="wait" custom={direction}>
                    {/* Step 1: Name */}
                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="space-y-5"
                        >
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/5 flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-serif text-lg font-semibold">
                                    What should we call you?
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    This name will appear on your orders and communications
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Priya Sharma"
                                    value={formData.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Phone */}
                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="space-y-5"
                        >
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/5 flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-serif text-lg font-semibold">
                                    Your Contact Number
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Used for delivery and order updates only.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="e.g. 9876543210"
                                    value={formData.phone}
                                    onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    autoFocus
                                    required
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    10-digit Indian mobile number
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Address */}
                    {step === 3 && (
                        <motion.div
                            key="step-3"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="space-y-4"
                        >
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/5 flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-serif text-lg font-semibold">
                                    Shipping Address
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Where should we deliver your crystals?
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input
                                        id="street"
                                        placeholder="e.g. 42, Rose Garden Lane"
                                        value={formData.addressStreet}
                                        onChange={(e) => updateField("addressStreet", e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            placeholder="e.g. Mumbai"
                                            value={formData.addressCity}
                                            onChange={(e) => updateField("addressCity", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            placeholder="e.g. Maharashtra"
                                            value={formData.addressState}
                                            onChange={(e) => updateField("addressState", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input
                                        id="pincode"
                                        placeholder="e.g. 400001"
                                        value={formData.addressPincode}
                                        onChange={(e) => updateField("addressPincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
                    {step > 1 ? (
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            className="gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft size={16} /> Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < TOTAL_STEPS ? (
                        <Button onClick={nextStep} disabled={!canProceed()} className="gap-1.5">
                            Continue <ArrowRight size={16} />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={!canProceed() || loading}
                            className="gap-1.5"
                        >
                            {loading ? (
                                "Saving..."
                            ) : (
                                <>
                                    Finish <Check size={16} />
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default OnboardingForm;
