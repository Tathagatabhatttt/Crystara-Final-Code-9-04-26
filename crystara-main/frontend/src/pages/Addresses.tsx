import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Plus, Edit2, Trash2, Save, X, Loader2, ArrowLeft, Home, Briefcase, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

interface Address {
    id: string;
    label: string;
    type: "home" | "work" | "other";
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

const emptyAddress: Omit<Address, "id"> = {
    label: "",
    type: "home",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
};

const Addresses = () => {
    const { user, session, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Omit<Address, "id">>(emptyAddress);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/auth");
            return;
        }
        if (!authLoading && profile?.role === "admin") {
            navigate("/admin");
            return;
        }
        if (session?.access_token) {
            fetchAddresses();
        }
    }, [user, session, profile?.role, authLoading, navigate]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_URL}/profile`,
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
            const profile = data.profile;

            // Build address list from profile data
            const addressList: Address[] = [];

            // Primary address from profile
            if (profile.address_street || profile.address_city) {
                addressList.push({
                    id: "primary",
                    label: "Primary Address",
                    type: "home",
                    street: profile.address_street || "",
                    city: profile.address_city || "",
                    state: profile.address_state || "",
                    pincode: profile.address_pincode || "",
                    isDefault: true,
                });
            }

            // Additional addresses from saved_addresses JSON field
            if (profile.saved_addresses && Array.isArray(profile.saved_addresses)) {
                addressList.push(...profile.saved_addresses);
            }

            setAddresses(addressList);
        } catch {
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!session?.access_token) {
            toast.error("Session expired. Please sign in again.");
            return;
        }

        if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
            toast.error("Please fill in all address fields");
            return;
        }

        setSaving(true);
        try {
            let updatedAddresses: Address[];

            if (editingId === "primary" || (!editingId && addresses.length === 0)) {
                // Update the primary address in profile fields
                const response = await fetch(
                    `${API_URL}/profile`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({
                            address_street: formData.street.trim(),
                            address_city: formData.city.trim(),
                            address_state: formData.state.trim(),
                            address_pincode: formData.pincode.trim(),
                        }),
                    }
                );

                if (!response.ok) throw new Error("Failed to update address");

                updatedAddresses = addresses.map((a) =>
                    a.id === "primary"
                        ? { ...a, street: formData.street, city: formData.city, state: formData.state, pincode: formData.pincode }
                        : a
                );

                if (!editingId && addresses.length === 0) {
                    updatedAddresses = [
                        {
                            id: "primary",
                            label: formData.label || "Primary Address",
                            type: formData.type,
                            street: formData.street,
                            city: formData.city,
                            state: formData.state,
                            pincode: formData.pincode,
                            isDefault: true,
                        },
                    ];
                }
            } else {
                // Additional addresses stored as JSON
                const existingExtra = addresses.filter((a) => a.id !== "primary");
                const newAddress: Address = {
                    id: editingId || `addr_${Date.now()}`,
                    label: formData.label || (formData.type === "work" ? "Work" : "Home"),
                    type: formData.type,
                    street: formData.street.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim(),
                    isDefault: false,
                };

                if (editingId) {
                    updatedAddresses = [
                        ...addresses.filter((a) => a.id === "primary"),
                        ...existingExtra.map((a) => (a.id === editingId ? newAddress : a)),
                    ];
                } else {
                    updatedAddresses = [...addresses, newAddress];
                }

                const extraAddresses = updatedAddresses.filter((a) => a.id !== "primary");

                const response = await fetch(
                    `${API_URL}/profile`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({
                            saved_addresses: extraAddresses,
                        }),
                    }
                );

                if (!response.ok) throw new Error("Failed to save address");
            }

            setAddresses(updatedAddresses);
            resetForm();
            toast.success(editingId ? "Address updated ✨" : "Address added ✨");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save address";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!session?.access_token) return;

        try {
            if (id === "primary") {
                await fetch(`${API_URL}/profile`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        address_street: null,
                        address_city: null,
                        address_state: null,
                        address_pincode: null,
                    }),
                });
            } else {
                const extraAddresses = addresses.filter((a) => a.id !== "primary" && a.id !== id);
                await fetch(`${API_URL}/profile`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ saved_addresses: extraAddresses }),
                });
            }

            setAddresses((prev) => prev.filter((a) => a.id !== id));
            toast.success("Address removed");
        } catch {
            toast.error("Failed to delete address");
        }
    };

    const startEdit = (address: Address) => {
        setEditingId(address.id);
        setFormData({
            label: address.label,
            type: address.type,
            street: address.street,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: address.isDefault,
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData(emptyAddress);
        setShowForm(false);
    };

    const updateField = (field: keyof Omit<Address, "id">, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "home": return <Home className="w-4 h-4" />;
            case "work": return <Briefcase className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="pt-20 flex items-center justify-center min-h-[60vh]">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-muted-foreground">Loading addresses...</span>
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

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-serif font-bold">
                                    <span className="text-gradient-mystic">Addresses</span>
                                </h1>
                            </div>
                            <p className="text-muted-foreground text-sm ml-[52px]">
                                Manage your delivery addresses
                            </p>
                        </div>
                        {!showForm && (
                            <Button
                                onClick={() => { resetForm(); setShowForm(true); }}
                                className="gap-1.5"
                            >
                                <Plus size={16} /> Add New
                            </Button>
                        )}
                    </div>

                    {/* Add/Edit Form */}
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <Card className="bg-card border-border shadow-crystal">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-serif">
                                            {editingId ? "Edit Address" : "New Address"}
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" onClick={resetForm}>
                                            <X size={16} />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Address Type */}
                                    <div className="space-y-2">
                                        <Label>Address Type</Label>
                                        <div className="flex gap-2">
                                            {(["home", "work", "other"] as const).map((type) => (
                                                <Button
                                                    key={type}
                                                    type="button"
                                                    variant={formData.type === type ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => updateField("type", type)}
                                                    className="gap-1.5 capitalize"
                                                >
                                                    {getTypeIcon(type)} {type}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="addr-label">Label (optional)</Label>
                                        <Input
                                            id="addr-label"
                                            placeholder="e.g. Mom's House, Main Office"
                                            value={formData.label}
                                            onChange={(e) => updateField("label", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="addr-street">Street Address</Label>
                                        <Input
                                            id="addr-street"
                                            placeholder="e.g. 42, Rose Garden Lane"
                                            value={formData.street}
                                            onChange={(e) => updateField("street", e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="addr-city">City</Label>
                                            <Input
                                                id="addr-city"
                                                placeholder="e.g. Mumbai"
                                                value={formData.city}
                                                onChange={(e) => updateField("city", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="addr-state">State</Label>
                                            <Input
                                                id="addr-state"
                                                placeholder="e.g. Maharashtra"
                                                value={formData.state}
                                                onChange={(e) => updateField("state", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="addr-pincode">Pincode</Label>
                                        <Input
                                            id="addr-pincode"
                                            placeholder="e.g. 400001"
                                            value={formData.pincode}
                                            onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button variant="outline" onClick={resetForm}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                                            {saving ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" /> Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} /> {editingId ? "Update" : "Save Address"}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Address List */}
                    {addresses.length === 0 && !showForm ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="border-dashed border-border">
                                <CardContent className="pt-12 pb-12 text-center">
                                    <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
                                    <h3 className="text-xl font-serif font-semibold mb-2">No Addresses Yet</h3>
                                    <p className="text-muted-foreground text-sm mb-6">
                                        Add a delivery address to make checkout faster
                                    </p>
                                    <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-1.5">
                                        <Plus size={16} /> Add Your First Address
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((address, index) => (
                                <motion.div
                                    key={address.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="bg-card border-border hover:border-primary/30 hover:shadow-crystal transition-all">
                                        <CardContent className="p-4 md:p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        {getTypeIcon(address.type)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <h3 className="font-semibold text-sm truncate">
                                                                {address.label || (address.type === "work" ? "Work" : "Home")}
                                                            </h3>
                                                            <Badge variant="secondary" className="text-xs capitalize">
                                                                {address.type}
                                                            </Badge>
                                                            {address.isDefault && (
                                                                <Badge className="text-xs gap-1 bg-primary/10 text-primary border-primary/20">
                                                                    <Check size={10} /> Default
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            {address.street}
                                                            {address.city && <>, {address.city}</>}
                                                            {address.state && <>, {address.state}</>}
                                                            {address.pincode && <> — {address.pincode}</>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => startEdit(address)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <Edit2 size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(address.id)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default Addresses;
