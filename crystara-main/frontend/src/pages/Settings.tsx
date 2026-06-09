import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Phone, MapPin, Save, Loader2, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProfileData {
    name: string;
    phone: string;
    address_street: string;
    address_city: string;
    address_state: string;
    address_pincode: string;
}

const Settings = () => {
    const { user, session, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<ProfileData>({
        name: "",
        phone: "",
        address_street: "",
        address_city: "",
        address_state: "",
        address_pincode: "",
    });
    const [originalData, setOriginalData] = useState<ProfileData | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/auth");
            return;
        }
        if (session?.access_token) {
            fetchProfile();
        }
    }, [user, session, authLoading, navigate]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL}/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setLoading(false);
                    return;
                }
                throw new Error("Failed to fetch profile");
            }

            const data = await response.json();
            const profile = {
                name: data.profile.name || "",
                phone: data.profile.phone || "",
                address_street: data.profile.address_street || "",
                address_city: data.profile.address_city || "",
                address_state: data.profile.address_state || "",
                address_pincode: data.profile.address_pincode || "",
            };
            setFormData(profile);
            setOriginalData(profile);
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        if (!originalData) return true;
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    };

    const handleSave = async () => {
        if (!session?.access_token) {
            toast.error("Session expired. Please sign in again.");
            return;
        }

        if (!formData.name.trim()) {
            toast.error("Name is required");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL}/profile`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        phone: formData.phone.trim(),
                        address_street: formData.address_street.trim(),
                        address_city: formData.address_city.trim(),
                        address_state: formData.address_state.trim(),
                        address_pincode: formData.address_pincode.trim(),
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

            const updated = {
                name: data.profile?.name || formData.name,
                phone: data.profile?.phone || formData.phone,
                address_street: data.profile?.address_street || formData.address_street,
                address_city: data.profile?.address_city || formData.address_city,
                address_state: data.profile?.address_state || formData.address_state,
                address_pincode: data.profile?.address_pincode || formData.address_pincode,
            };
            setFormData(updated);
            setOriginalData(updated);
            toast.success("Profile updated successfully ✨");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update profile";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof ProfileData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="pt-20 flex items-center justify-center min-h-[60vh]">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-muted-foreground">Loading settings...</span>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="container mx-auto px-4 py-8 md:py-16 max-w-2xl"
                >
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/profile")}
                        className="mb-6 gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
                    >
                        <ArrowLeft size={16} /> Back to Profile
                    </Button>

                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <SettingsIcon className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold">
                                <span className="text-gradient-mystic">Settings</span>
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-sm ml-[52px]">
                            Manage your account details and shipping address
                        </p>
                    </div>

                    {/* Personal Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-card border-border shadow-crystal mb-6">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    <CardTitle className="text-lg font-serif">Personal Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="settings-name">Full Name</Label>
                                    <Input
                                        id="settings-name"
                                        placeholder="Your full name"
                                        value={formData.name}
                                        onChange={(e) => updateField("name", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="settings-email">Email</Label>
                                    <Input
                                        id="settings-email"
                                        value={user?.email || ""}
                                        disabled
                                        className="opacity-60 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="settings-phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="settings-phone"
                                            type="tel"
                                            placeholder="e.g. 9876543210"
                                            value={formData.phone}
                                            onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Shipping Address */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-card border-border shadow-crystal mb-8">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <CardTitle className="text-lg font-serif">Shipping Address</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="settings-street">Street Address</Label>
                                    <Input
                                        id="settings-street"
                                        placeholder="e.g. 42, Rose Garden Lane"
                                        value={formData.address_street}
                                        onChange={(e) => updateField("address_street", e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="settings-city">City</Label>
                                        <Input
                                            id="settings-city"
                                            placeholder="e.g. Mumbai"
                                            value={formData.address_city}
                                            onChange={(e) => updateField("address_city", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="settings-state">State</Label>
                                        <Input
                                            id="settings-state"
                                            placeholder="e.g. Maharashtra"
                                            value={formData.address_state}
                                            onChange={(e) => updateField("address_state", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="settings-pincode">Pincode</Label>
                                    <Input
                                        id="settings-pincode"
                                        placeholder="e.g. 400001"
                                        value={formData.address_pincode}
                                        onChange={(e) => updateField("address_pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Save Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-end"
                    >
                        <Button
                            onClick={handleSave}
                            disabled={saving || !hasChanges()}
                            className="gap-2 px-8"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> Save Changes
                                </>
                            )}
                        </Button>
                    </motion.div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default Settings;
