import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Package, Truck, LogOut } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  BarChart3,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Eye,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  CreditCard,
  MousePointerClick,
  Heart,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getProductById } from "@/data/products";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAllProducts } from "@/hooks/useProducts";
import { Plus, Pencil, Upload } from "lucide-react";

interface AnalyticsProductItem {
  id: string;
  count: number;
  name: string;
  category: string;
  image: string;
}

interface AnalyticsOverview {
  pageViews: number;
  uniqueVisitors: number;
  productClicks: AnalyticsProductItem[];
  cartAdditions: AnalyticsProductItem[];
  wishlistInterests: AnalyticsProductItem[];
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  items: OrderItem[];
  status:
    | "pending"
    | "awaiting_payment"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "completed"
    | "failed"
    | "cancelled";
  user_id: string;
  shipping_address?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    zip?: string;
    payment_method?: string;
  };
  user_profiles?: {
    email: string;
    name: string;
  };
  created_at: string;
  updated_at?: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  awaitingPaymentOrders: number;
  failedOrders: number;
  cancelledOrders: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SavedAddress {
  id?: string;
  label?: string;
  type?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface CustomerDetail {
  user_id: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_pincode?: string;
  saved_addresses?: SavedAddress[];
  orders: Order[];
  wishlist: string[];
  cart: {
    items: OrderItem[];
    updated_at: string | null;
  };
  created_at?: string;
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const PREDEFINED_CATEGORIES = [
  {
    name: "Bracelets",
    slug: "bracelets",
    subCategories: [
      { name: "Chip Bracelet", slug: "chip-bracelet" },
      { name: "Beads Bracelet", slug: "beads-bracelet" }
    ]
  },
  {
    name: "Rings",
    slug: "rings",
    subCategories: [
      { name: "Diamond Cut Oval Faced", slug: "diamond-cut-oval-faced" },
      { name: "Round Gem Stone", slug: "round-gem-stone" },
      { name: "Heart Shaped", slug: "heart-shaped" },
      { name: "Feather Touch", slug: "feather-touch" },
      { name: "Moon Shaped", slug: "moon-shaped" },
      { name: "Boho", slug: "boho" }
    ]
  },
  {
    name: "Lockets / Pendants",
    slug: "lockets",
    subCategories: [
      { name: "Silver Cap Pendant", slug: "silver-cap-pendant" },
      { name: "Heart Shaped Pendant", slug: "heart-shaped-pendant" },
      { name: "Tortoise Shaped Pendant", slug: "tortoise-shaped-pendant" },
      { name: "Moon Owl Shaped Pendant", slug: "moon-owl-shaped-pendant" },
      { name: "Thread Wrapped Pendant", slug: "thread-wrapped-pendant" },
      { name: "Silver Wire Wrapped Pendant", slug: "silver-wire-wrapped-pendant" },
      { name: "Raw Stone Pendant", slug: "raw-stone-pendant" }
    ]
  },
  {
    name: "Pyramids",
    slug: "pyramids",
    subCategories: [
      { name: "Orgone Pyramid", slug: "orgone-pyramid" },
      { name: "Single Stone Pyramid", slug: "single-stone-pyramid" }
    ]
  },
  {
    name: "Frames",
    slug: "frames",
    subCategories: [
      { name: "Pyrite Frame (6/6 inch)", slug: "pyrite-frame" },
      { name: "Pyrite Multi Frame Golden Base", slug: "pyrite-multi-frame" }
    ]
  },
  {
    name: "Combos",
    slug: "combos",
    subCategories: [
      { name: "Combo Offers", slug: "combo-offers" }
    ]
  }
];

const AdminPanel = () => {
  const { user, session, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [customers, setCustomers] = useState<CustomerDetail[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [verifyingRole, setVerifyingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin Management States
  const [admins, setAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);

  // Catalog Management States
  const queryClient = useQueryClient();
  const { data: allMergedProducts, isLoading: isLoadingAllProducts, refetch: refetchAllProducts } = useAllProducts();
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState("all");
  const [catalogSourceFilter, setCatalogSourceFilter] = useState("all");
  const [catalogPage, setCatalogPage] = useState(1);

  // Form States for Product CRUD
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [prodId, setProdId] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodStone, setProdStone] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOriginalPrice, setProdOriginalPrice] = useState("");
  const [prodBenefit, setProdBenefit] = useState("");
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodCategory, setProdCategory] = useState("");
  const [prodCategorySlug, setProdCategorySlug] = useState("");
  const [prodSubCategory, setProdSubCategory] = useState("");
  const [prodSubCategorySlug, setProdSubCategorySlug] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [prodImageFile, setProdImageFile] = useState<File | null>(null);
  const [prodImagePreview, setProdImagePreview] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

  // Order Address Editing States
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editOrderName, setEditOrderName] = useState("");
  const [editOrderEmail, setEditOrderEmail] = useState("");
  const [editOrderPhone, setEditOrderPhone] = useState("");
  const [editOrderStreet, setEditOrderStreet] = useState("");
  const [editOrderCity, setEditOrderCity] = useState("");
  const [editOrderState, setEditOrderState] = useState("");
  const [editOrderPincode, setEditOrderPincode] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!selectedOrder) {
      setIsEditingAddress(false);
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (authLoading) return;

    if (!session?.access_token) {
      setVerifyingRole(false);
      navigate("/auth");
      return;
    }

    if (profile) {
      if (profile.role === "admin") {
        setIsAdmin(true);
        setVerifyingRole(false);
      } else {
        toast.error("Admin access required");
        navigate("/");
      }
    }
  }, [session, profile, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchOrders();
      fetchAnalytics();
      fetchCustomers();
      fetchAdmins();
      fetchSupabaseProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, statusFilter, currentPage]);

  // Real-time subscription for admin order updates
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order;
            toast.success(`New order #${newOrder.order_id} received!`);
            fetchOrders();
            fetchStats();
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
            
            // Only toast if we didn't just update it ourselves
            if (updated.id !== updatingOrderId) {
              const label = updated.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              toast.info(`Order #${updated.order_id} status changed to ${label}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, updatingOrderId]);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await fetch(
        `${API_URL}/api/analytics/overview`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_URL}/admin/orders/stats/overview`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await fetch(
        `${API_URL}/admin/customers`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to fetch customer details");
      }

      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load customer details");
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const response = await fetch(`${API_URL}/admin/admins`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to fetch admin list");
      }

      const data = await response.json();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load admin users");
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchSupabaseProducts = async () => {
    try {
      setLoadingCatalog(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSupabaseProducts(data || []);
    } catch (err) {
      console.error("Error fetching Supabase products:", err);
      toast.error("Failed to load custom products catalog");
    } finally {
      setLoadingCatalog(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProdId("");
    setProdName("");
    setProdStone("");
    setProdPrice("");
    setProdOriginalPrice("");
    setProdBenefit("");
    setProdFeatured(false);
    setProdCategory("Bracelets");
    setProdCategorySlug("bracelets");
    setProdSubCategory("Chip Bracelet");
    setProdSubCategorySlug("chip-bracelet");
    setProdImage("");
    setProdImageFile(null);
    setProdImagePreview("");
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: any, isCustom: boolean) => {
    setEditingProduct({ ...product, isCustom });
    setProdId(product.id);
    setProdName(product.name);
    setProdStone(product.stone || "");
    setProdPrice(product.price.toString());
    setProdOriginalPrice(product.originalPrice?.toString() || "");
    setProdBenefit(product.benefit || "");
    setProdFeatured(product.featured || false);
    setProdCategory(product.category || "");
    setProdCategorySlug(product.categorySlug || "");
    setProdSubCategory(product.subCategory || "");
    setProdSubCategorySlug(product.subCategorySlug || "");
    setProdImage(product.image || "");
    setProdImageFile(null);
    setProdImagePreview("");
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? If this is a Sanity CMS override, it will revert to the original CMS catalog entry.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success("Product deleted successfully");
      fetchSupabaseProducts();
      queryClient.invalidateQueries({ queryKey: ["sanity-all-products"] });
    } catch (err: any) {
      console.error("Delete product error:", err);
      toast.error(err.message || "Failed to delete product");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodId) {
      toast.error("Product ID/Slug is required");
      return;
    }
    if (!prodName) {
      toast.error("Product name is required");
      return;
    }
    if (!prodPrice || isNaN(Number(prodPrice))) {
      toast.error("Valid product price is required");
      return;
    }
    if (!prodCategory) {
      toast.error("Category is required");
      return;
    }

    try {
      setSavingProduct(true);
      let finalImageUrl = prodImage;

      // Handle image file upload if selected
      if (prodImageFile) {
        const fileExt = prodImageFile.name.split(".").pop();
        const fileName = `products/${prodId}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, prodImageFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}. Make sure a public bucket 'product-images' exists in Supabase Storage.`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      if (!finalImageUrl) {
        toast.error("Please upload a product image or specify an image URL");
        setSavingProduct(false);
        return;
      }

      const productRecord = {
        id: prodId,
        name: prodName,
        stone: prodStone || null,
        price: Number(prodPrice),
        original_price: prodOriginalPrice ? Number(prodOriginalPrice) : null,
        benefit: prodBenefit || null,
        image: finalImageUrl,
        featured: prodFeatured,
        category: prodCategory,
        category_slug: prodCategorySlug || slugify(prodCategory),
        sub_category: prodSubCategory || null,
        sub_category_slug: prodSubCategorySlug || (prodSubCategory ? slugify(prodSubCategory) : null),
      };

      const { error: dbError } = await supabase
        .from("products")
        .upsert(productRecord);

      if (dbError) throw dbError;

      toast.success(editingProduct ? "Product updated successfully" : "Product created successfully");
      setIsProductModalOpen(false);
      fetchSupabaseProducts();
      queryClient.invalidateQueries({ queryKey: ["sanity-all-products"] });
    } catch (err: any) {
      console.error("Save product error:", err);
      toast.error(err.message || "Failed to save product");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    if (categoryName === "custom") {
      setProdCategory("");
      setProdCategorySlug("");
      setProdSubCategory("");
      setProdSubCategorySlug("");
    } else {
      setProdCategory(categoryName);
      const catObj = PREDEFINED_CATEGORIES.find(c => c.name === categoryName);
      if (catObj) {
        setProdCategorySlug(catObj.slug);
        if (catObj.subCategories.length > 0) {
          setProdSubCategory(catObj.subCategories[0].name);
          setProdSubCategorySlug(catObj.subCategories[0].slug);
        } else {
          setProdSubCategory("");
          setProdSubCategorySlug("");
        }
      }
    }
  };

  const handleSubCategorySelect = (subCategoryName: string) => {
    if (subCategoryName === "custom") {
      setProdSubCategory("");
      setProdSubCategorySlug("");
    } else {
      setProdSubCategory(subCategoryName);
      const catObj = PREDEFINED_CATEGORIES.find(c => c.name === prodCategory);
      if (catObj) {
        const subObj = catObj.subCategories.find(s => s.name === subCategoryName);
        if (subObj) {
          setProdSubCategorySlug(subObj.slug);
        }
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProdName(name);
    if (!editingProduct) {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setProdId(slug);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      toast.error("Email and password are required");
      return;
    }
    if (adminPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setCreatingAdmin(true);
      const response = await fetch(`${API_URL}/admin/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          role: "admin",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create admin");
      }

      toast.success("Admin user created successfully!");
      setAdminEmail("");
      setAdminPassword("");
      fetchAdmins(); // Refresh list
    } catch (err: any) {
      toast.error(err.message || "Failed to create admin");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (adminId === user?.id) {
      toast.error("You cannot delete your own account!");
      return;
    }

    if (!confirm("Are you sure you want to delete this admin account? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingAdminId(adminId);
      const response = await fetch(`${API_URL}/admin/users/${adminId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete admin");
      }

      toast.success("Admin account deleted successfully!");
      fetchAdmins(); // Refresh list
    } catch (err: any) {
      toast.error(err.message || "Failed to delete admin");
    } finally {
      setDeletingAdminId(null);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer account? This will permanently delete their account, order associations, and profile, and cannot be undone.")) {
      return;
    }

    try {
      setDeletingCustomerId(customerId);
      const response = await fetch(`${API_URL}/admin/users/${customerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete customer");
      }

      toast.success("Customer account deleted successfully!");
      fetchCustomers(); // Refresh list
    } catch (err: any) {
      toast.error(err.message || "Failed to delete customer");
    } finally {
      setDeletingCustomerId(null);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_URL}/admin/orders?page=${currentPage}&limit=20`;

      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Admin access required");
        }
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await fetch(
        `${API_URL}/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const result = await response.json();
      setOrders(
        orders.map((order) => (order.id === orderId ? result.order : order)),
      );
      toast.success("Order status updated successfully");
      fetchStats();
    } catch (err) {
      toast.error("Failed to update order status");
      console.error("Error:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order record permanently? This action cannot be undone.")) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete order");
      }

      toast.success("Order deleted successfully!");
      fetchOrders(); // Refresh order list
      fetchStats();  // Refresh stats
    } catch (err: any) {
      toast.error(err.message || "Failed to delete order");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStartEditAddress = (order: Order) => {
    setEditOrderName(getCustomerName(order));
    setEditOrderEmail(getCustomerEmail(order));
    setEditOrderPhone(getCustomerPhone(order) === "Not provided" ? "" : getCustomerPhone(order));
    setEditOrderStreet(getStreetAddress(order));
    setEditOrderCity(order.shipping_address?.city || "");
    setEditOrderState(order.shipping_address?.state || "");
    setEditOrderPincode(getPincode(order));
    setIsEditingAddress(true);
  };

  const handleSaveOrderAddress = async (orderId: string) => {
    if (!editOrderName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!editOrderStreet.trim()) {
      toast.error("Street address is required");
      return;
    }

    try {
      setSavingAddress(true);

      const updatedShippingAddress = {
        ...(selectedOrder?.shipping_address || {}),
        name: editOrderName.trim(),
        email: editOrderEmail.trim(),
        phone: editOrderPhone.trim(),
        address: editOrderStreet.trim(),
        street: editOrderStreet.trim(),
        city: editOrderCity.trim(),
        state: editOrderState.trim(),
        pincode: editOrderPincode.trim(),
        zip: editOrderPincode.trim(),
      };

      const response = await fetch(
        `${API_URL}/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ shipping_address: updatedShippingAddress }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update shipping address");
      }

      setOrders(
        orders.map((order) => (order.id === orderId ? data.order : order))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(data.order);
      }

      toast.success("Order address and contact details updated successfully!");
      setIsEditingAddress(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update address");
      console.error("Error editing address:", err);
    } finally {
      setSavingAddress(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
      case "awaiting_payment":
      case "confirmed":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-blue-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
      case "awaiting_payment":
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCustomerName = (order: Order) =>
    order.shipping_address?.name || order.user_profiles?.name || "Unknown";

  const getCustomerEmail = (order: Order) =>
    order.shipping_address?.email || order.user_profiles?.email || "Unknown";

  const getCustomerPhone = (order: Order) =>
    order.shipping_address?.phone || "Not provided";

  const getStreetAddress = (order: Order) =>
    order.shipping_address?.address || order.shipping_address?.street || "";

  const getPincode = (order: Order) =>
    order.shipping_address?.pincode || order.shipping_address?.zip || "";

  const formatStatus = (status: string) =>
    status
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const filteredOrders = orders.filter(
    (order) =>
      order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerEmail(order).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerName(order).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerPhone(order).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredCatalog = allMergedProducts
    ? allMergedProducts.filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
          p.id.toLowerCase().includes(catalogSearch.toLowerCase()) ||
          (p.stone && p.stone.toLowerCase().includes(catalogSearch.toLowerCase()));
        
        const matchesCategory =
          catalogCategoryFilter === "all" || p.categorySlug === catalogCategoryFilter;
        
        const isCustom = supabaseProducts.some((sp) => sp.id === p.id);
        const matchesSource =
          catalogSourceFilter === "all" ||
          (catalogSourceFilter === "custom" && isCustom) ||
          (catalogSourceFilter === "sanity" && !isCustom);

        return matchesSearch && matchesCategory && matchesSource;
      })
    : [];

  const catalogLimit = 10;
  const totalCatalogPages = Math.ceil(filteredCatalog.length / catalogLimit);
  const paginatedCatalog = filteredCatalog.slice(
    (catalogPage - 1) * catalogLimit,
    catalogPage * catalogLimit
  );

  if (verifyingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">Verifying admin access...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 mt-20">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage and track all customer orders
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Statistics Cards */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-secondary/40 p-1 rounded-xl w-full max-w-4xl grid grid-cols-5 border border-border/40">
            <TabsTrigger value="orders" className="rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingBag className="w-4 h-4" />
              Orders Management
            </TabsTrigger>
            <TabsTrigger value="catalog" className="rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="w-4 h-4" />
              Catalog Manager
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              Site Analytics
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="admin-users" className="rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShieldCheck className="w-4 h-4" />
              Admin Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6 pt-2">
            {/* Statistics Cards */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12"
              >
            {/* Total Orders */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{Number(stats.totalRevenue).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pending
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.pendingOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confirmed */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Confirmed
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.confirmedOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipped */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <Truck className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Shipped
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.shippedOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivered */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Delivered
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.deliveredOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.completedOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Failed */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Failed
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.failedOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancelled */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cancelled
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.cancelledOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Manage all customer orders and their statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by order ID, name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="md:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center gap-3 py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    Loading orders...
                  </span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    No orders found
                  </p>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium font-mono text-sm">
                              {order.order_id}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {getCustomerName(order)}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {getCustomerEmail(order)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getCustomerPhone(order)}
                            </TableCell>
                            <TableCell className="font-semibold">
                              ₹{Number(order.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(order.status)}
                                  {formatStatus(order.status)}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(order.created_at)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    disabled={updatingOrderId === order.id}
                                  >
                                    {updatingOrderId === order.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <MoreVertical className="w-4 h-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {order.status !== "completed" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          order.id,
                                          "completed",
                                        )
                                      }
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                      Mark as Completed
                                    </DropdownMenuItem>
                                  )}
                                  {order.status !== "pending" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          order.id,
                                          "pending",
                                        )
                                      }
                                    >
                                      <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                                      Mark as Pending
                                    </DropdownMenuItem>
                                  )}
                                  {order.status !== "confirmed" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          order.id,
                                          "confirmed",
                                        )
                                      }
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                                      Mark as Confirmed
                                    </DropdownMenuItem>
                                  )}
                                  {order.status !== "shipped" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          order.id,
                                          "shipped",
                                        )
                                      }
                                    >
                                      <Truck className="w-4 h-4 mr-2 text-indigo-600" />
                                      Mark as Shipped
                                    </DropdownMenuItem>
                                  )}
                                  {order.status !== "delivered" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          order.id,
                                          "delivered",
                                        )
                                      }
                                    >
                                      <Package className="w-4 h-4 mr-2 text-emerald-600" />
                                      Mark as Delivered
                                    </DropdownMenuItem>
                                  )}
                                  {order.status !== "failed" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          order.id,
                                          "failed",
                                        )
                                      }
                                    >
                                      <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                      Mark as Failed
                                    </DropdownMenuItem>
                                  )}
                                  {order.status !== "cancelled" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          order.id,
                                          "cancelled",
                                        )
                                      }
                                    >
                                      <XCircle className="w-4 h-4 mr-2 text-gray-600" />
                                      Mark as Cancelled
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="text-destructive focus:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Order
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Page {pagination.page} of {pagination.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          disabled={currentPage === pagination.totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6 pt-2">
          <Card className="bg-card border-border shadow-crystal">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-serif">Catalog Manager</CardTitle>
                <CardDescription>
                  Add, edit, or override products in the store catalog. Upload images directly to Supabase Storage.
                </CardDescription>
              </div>
              <Button onClick={handleOpenAddModal} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent>
              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, stone, or slug..."
                    value={catalogSearch}
                    onChange={(e) => {
                      setCatalogSearch(e.target.value);
                      setCatalogPage(1);
                    }}
                    className="pl-9 bg-background/50"
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select
                    value={catalogCategoryFilter}
                    onValueChange={(val) => {
                      setCatalogCategoryFilter(val);
                      setCatalogPage(1);
                    }}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {PREDEFINED_CATEGORIES.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select
                    value={catalogSourceFilter}
                    onValueChange={(val) => {
                      setCatalogSourceFilter(val);
                      setCatalogPage(1);
                    }}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="sanity">Sanity CMS</SelectItem>
                      <SelectItem value="custom">Custom DB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products Table */}
              {isLoadingAllProducts || loadingCatalog ? (
                <div className="flex justify-center items-center gap-3 py-24">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-lg text-muted-foreground">Loading products...</span>
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-border rounded-xl">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">No products found</h3>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or add a new product.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead>Product Info</TableHead>
                          <TableHead>Category / Subcategory</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCatalog.map((product) => {
                          const isCustom = supabaseProducts.some((sp) => sp.id === product.id);
                          const isFeatured = product.featured;
                          return (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border">
                                  <img
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold text-foreground flex items-center gap-2">
                                  {product.name}
                                  {isFeatured && (
                                    <Badge variant="outline" className="text-[10px] py-0 px-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  ID: {product.id}
                                </div>
                                {product.stone && (
                                  <div className="text-xs text-muted-foreground">
                                    Stone: {product.stone}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium">{product.category}</div>
                                {product.subCategory && (
                                  <div className="text-xs text-muted-foreground">
                                    {product.subCategory}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-bold text-foreground">
                                  ₹{product.price.toLocaleString()}
                                </div>
                                {product.originalPrice && (
                                  <div className="text-xs text-muted-foreground line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {isCustom ? (
                                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    Custom DB
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    Sanity CMS
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenEditModal(product, isCustom)}
                                    className="gap-1.5"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    {isCustom ? "Edit" : "Override"}
                                  </Button>
                                  {isCustom && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Client side pagination */}
                  {totalCatalogPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {(catalogPage - 1) * catalogLimit + 1} to{" "}
                        {Math.min(catalogPage * catalogLimit, filteredCatalog.length)} of{" "}
                        {filteredCatalog.length} products
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={catalogPage === 1}
                          onClick={() => setCatalogPage((p) => p - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={catalogPage === totalCatalogPages}
                          onClick={() => setCatalogPage((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 pt-2">
          {loadingAnalytics ? (
            <div className="flex justify-center items-center gap-3 py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-lg text-muted-foreground">Loading site analytics...</span>
            </div>
          ) : !analytics ? (
            <div className="text-center py-24 border border-dashed border-border rounded-xl bg-card">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold">No Analytics Data Available</h3>
              <p className="text-sm text-muted-foreground mt-1">Visit your store pages first to generate tracking events.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Traffic Metric Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-card border-border shadow-crystal">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
                        <h3 className="text-3xl font-bold mt-1 text-foreground font-serif">{analytics.uniqueVisitors}</h3>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-crystal">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Page Views</p>
                        <h3 className="text-3xl font-bold mt-1 text-foreground font-serif">{analytics.pageViews}</h3>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Eye className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-crystal">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pages / Session</p>
                        <h3 className="text-3xl font-bold mt-1 text-foreground font-serif">
                          {analytics.uniqueVisitors > 0 
                            ? (analytics.pageViews / analytics.uniqueVisitors).toFixed(1)
                            : "0.0"}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-crystal">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Order Conversion</p>
                        <h3 className="text-3xl font-bold mt-1 text-foreground font-serif">
                          {analytics.uniqueVisitors > 0 && stats
                            ? `${((stats.totalOrders / analytics.uniqueVisitors) * 100).toFixed(1)}%`
                            : "0.0%"}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <CreditCard className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detail metrics charts (clicks, cart additions, wishlists) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Clicked */}
                <Card className="bg-card border-border shadow-crystal flex flex-col h-[550px]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="w-5 h-5 text-indigo-500" />
                      <div>
                        <CardTitle className="text-lg font-serif">Most Clicked Crystals</CardTitle>
                        <CardDescription>Product page views & click interest</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto pr-2">
                    {analytics.productClicks.length === 0 ? (
                      <div className="text-center py-12 text-sm text-muted-foreground">No clicks recorded yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {analytics.productClicks.map((item) => {
                          const maxVal = analytics.productClicks[0]?.count || 1;
                          const pct = (item.count / maxVal) * 100;
                          return (
                            <div key={item.id} className="space-y-1">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.category}</p>
                                </div>
                                <span className="text-xs font-bold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">{item.count} views</span>
                              </div>
                              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden ml-11 max-w-[calc(100%-44px)]">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Added To Cart */}
                <Card className="bg-card border-border shadow-crystal flex flex-col h-[550px]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-500" />
                      <div>
                        <CardTitle className="text-lg font-serif">Most Added to Cart</CardTitle>
                        <CardDescription>Items with high purchase intent</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto pr-2">
                    {analytics.cartAdditions.length === 0 ? (
                      <div className="text-center py-12 text-sm text-muted-foreground">No additions to cart yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {analytics.cartAdditions.map((item) => {
                          const maxVal = analytics.cartAdditions[0]?.count || 1;
                          const pct = (item.count / maxVal) * 100;
                          return (
                            <div key={item.id} className="space-y-1">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.category}</p>
                                </div>
                                <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">{item.count} adds</span>
                              </div>
                              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden ml-11 max-w-[calc(100%-44px)]">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Wishlisted */}
                <Card className="bg-card border-border shadow-crystal flex flex-col h-[550px]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <div>
                        <CardTitle className="text-lg font-serif">Customer Wishlists</CardTitle>
                        <CardDescription>Crystals customers are interested in</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto pr-2">
                    {analytics.wishlistInterests.length === 0 ? (
                      <div className="text-center py-12 text-sm text-muted-foreground">No active wishlist items found.</div>
                    ) : (
                      <div className="space-y-4">
                        {analytics.wishlistInterests.map((item) => {
                          const maxVal = analytics.wishlistInterests[0]?.count || 1;
                          const pct = (item.count / maxVal) * 100;
                          return (
                            <div key={item.id} className="space-y-1">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.category}</p>
                                </div>
                                <span className="text-xs font-bold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">{item.count} saves</span>
                              </div>
                              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden ml-11 max-w-[calc(100%-44px)]">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="customers" className="space-y-6 pt-2">
          {loadingCustomers ? (
            <div className="flex justify-center items-center gap-3 py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600 dark:text-gray-400">
                Loading customer details...
              </span>
            </div>
          ) : customers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No customers found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {customers.map((customer) => {
                const primaryAddress = [
                  customer.address_street,
                  customer.address_city,
                  customer.address_state,
                  customer.address_pincode,
                ].filter(Boolean).join(", ");
                const savedAddresses = Array.isArray(customer.saved_addresses)
                  ? customer.saved_addresses
                  : [];
                const cartItems = customer.cart?.items || [];
                const latestOrder = customer.orders?.[0];

                return (
                  <Card key={customer.user_id} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            {customer.name || "Unnamed Customer"}
                          </CardTitle>
                          <CardDescription>
                            {customer.email || "No email"}{customer.phone ? ` | ${customer.phone}` : ""}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{customer.orders.length} orders</Badge>
                          <Badge variant="secondary">{customer.wishlist.length} wishlist</Badge>
                          <Badge variant="secondary">{cartItems.length} cart items</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingCustomerId === customer.user_id}
                            onClick={() => handleDeleteCustomer(customer.user_id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete Customer Account"
                          >
                            {deletingCustomerId === customer.user_id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Delivery Addresses</h4>
                          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                            {primaryAddress ? (
                              <p><span className="font-medium">Primary:</span> {primaryAddress}</p>
                            ) : (
                              <p className="text-muted-foreground">No primary address saved.</p>
                            )}
                            {savedAddresses.map((address, index) => (
                              <p key={address.id || index}>
                                <span className="font-medium">{address.label || `Address ${index + 1}`}:</span>{" "}
                                {[address.street, address.city, address.state, address.pincode].filter(Boolean).join(", ")}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Latest Order</h4>
                          <div className="rounded-lg bg-muted/50 p-3">
                            {latestOrder ? (
                              <div className="space-y-1">
                                <p><span className="font-medium">Order:</span> {latestOrder.order_id}</p>
                                <p><span className="font-medium">Amount:</span> ₹{Number(latestOrder.amount).toLocaleString()}</p>
                                <p><span className="font-medium">Status:</span> {formatStatus(latestOrder.status)}</p>
                                <p><span className="font-medium">Date:</span> {formatDate(latestOrder.created_at)}</p>
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No orders yet.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Current Cart</h4>
                          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                            {cartItems.length === 0 ? (
                              <p className="text-muted-foreground">No cart items saved.</p>
                            ) : (
                              cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between gap-3">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span className="font-medium">₹{Number(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))
                            )}
                            {customer.cart?.updated_at && (
                              <p className="text-xs text-muted-foreground pt-1">
                                Updated {formatDate(customer.cart.updated_at)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Wishlist</h4>
                          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                            {customer.wishlist.length === 0 ? (
                              <p className="text-muted-foreground">No wishlist items.</p>
                            ) : (
                              customer.wishlist.map((productId) => {
                                const product = getProductById(productId);
                                return (
                                  <p key={productId}>
                                    {product ? `${product.name} ${product.subCategory || ""}` : productId}
                                  </p>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="admin-users" className="space-y-6 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Admin Form */}
            <Card className="bg-card border-border shadow-crystal lg:col-span-1">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg font-serif">Create Admin</CardTitle>
                    <CardDescription>Register a new administrator account privately</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <Input
                      type="email"
                      placeholder="admin@crystara.co.in"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="bg-background/50 border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="bg-background/50 border-input"
                    />
                    <p className="text-[10px] text-muted-foreground">Minimum 6 characters. The account will be automatically confirmed.</p>
                  </div>
                  <Button type="submit" disabled={creatingAdmin} className="w-full gap-2">
                    {creatingAdmin ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Create Admin Account
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* List Admins */}
            <Card className="bg-card border-border shadow-crystal lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg font-serif">Admin Accounts</CardTitle>
                    <CardDescription>Manage administrators who have access to this dashboard</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAdmins ? (
                  <div className="flex justify-center items-center gap-3 py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading administrators...</span>
                  </div>
                ) : admins.length === 0 ? (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    No administrator accounts found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admins.map((adminItem) => {
                          const isSelf = adminItem.user_id === user?.id;
                          return (
                            <TableRow key={adminItem.user_id} className={isSelf ? "bg-primary/5" : ""}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <span>{adminItem.email}</span>
                                  {isSelf && (
                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-primary border-primary">
                                      You
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="capitalize">
                                  {adminItem.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {adminItem.created_at ? new Date(adminItem.created_at).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={isSelf || deletingAdminId === adminItem.user_id}
                                  onClick={() => handleDeleteAdmin(adminItem.user_id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  {deletingAdminId === adminItem.user_id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

        {/* Order Details Modal */}
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order Details
                </h2>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                  ✕
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Order ID
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                      {selectedOrder.order_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {formatStatus(selectedOrder.status)}
                    </Badge>
                  </div>
                </div>

                {/* Customer Info */}
                {isEditingAddress ? (
                  <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Edit Customer & Shipping Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">Customer Name *</label>
                        <Input
                          type="text"
                          value={editOrderName}
                          onChange={(e) => setEditOrderName(e.target.value)}
                          className="bg-white dark:bg-gray-955 text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">Customer Email</label>
                        <Input
                          type="email"
                          value={editOrderEmail}
                          onChange={(e) => setEditOrderEmail(e.target.value)}
                          className="bg-white dark:bg-gray-955 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">Customer Phone</label>
                        <Input
                          type="text"
                          value={editOrderPhone}
                          onChange={(e) => setEditOrderPhone(e.target.value)}
                          className="bg-white dark:bg-gray-955 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">Pincode</label>
                        <Input
                          type="text"
                          value={editOrderPincode}
                          onChange={(e) => setEditOrderPincode(e.target.value)}
                          className="bg-white dark:bg-gray-955 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">Street Address *</label>
                      <Input
                        type="text"
                        value={editOrderStreet}
                        onChange={(e) => setEditOrderStreet(e.target.value)}
                        className="bg-white dark:bg-gray-955 text-sm"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">City</label>
                        <Input
                          type="text"
                          value={editOrderCity}
                          onChange={(e) => setEditOrderCity(e.target.value)}
                          className="bg-white dark:bg-gray-955 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">State</label>
                        <Input
                          type="text"
                          value={editOrderState}
                          onChange={(e) => setEditOrderState(e.target.value)}
                          className="bg-white dark:bg-gray-955 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingAddress(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSaveOrderAddress(selectedOrder.id)}
                        disabled={savingAddress}
                        className="gap-1.5"
                      >
                        {savingAddress && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Details
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Customer Information
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEditAddress(selectedOrder)}
                        className="gap-1.5 h-8 text-xs"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit Details
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                      <p>
                        <span className="text-gray-600 dark:text-gray-400">
                          Name:
                        </span>{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getCustomerName(selectedOrder)}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600 dark:text-gray-400">
                          Email:
                        </span>{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getCustomerEmail(selectedOrder)}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600 dark:text-gray-400">
                          Phone:
                        </span>{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getCustomerPhone(selectedOrder)}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Items
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total Amount:</span>
                    <span>₹{Number(selectedOrder.amount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                {!isEditingAddress && selectedOrder.shipping_address && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Shipping Address
                    </h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm space-y-1">
                      {getStreetAddress(selectedOrder) && (
                        <p className="text-gray-900 dark:text-white">
                          {getStreetAddress(selectedOrder)}
                        </p>
                      )}
                      <p className="text-gray-900 dark:text-white">
                        {[
                          selectedOrder.shipping_address.city,
                          selectedOrder.shipping_address.state,
                          getPincode(selectedOrder),
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {getPincode(selectedOrder) && (
                        <p className="text-gray-900 dark:text-white">
                          <span className="text-gray-600 dark:text-gray-400">
                            Pincode:
                          </span>{" "}
                          {getPincode(selectedOrder)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Payment Details
                  </h3>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600 dark:text-gray-400">
                        Payment ID:
                      </span>{" "}
                      <span className="font-mono text-gray-900 dark:text-white">
                        {selectedOrder.payment_id}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600 dark:text-gray-400">
                        Payment Method:
                      </span>{" "}
                      <span className="text-gray-900 dark:text-white capitalize">
                        {selectedOrder.shipping_address?.payment_method || "Not recorded"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600 dark:text-gray-400">
                        Created:
                      </span>{" "}
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(selectedOrder.created_at)}
                      </span>
                    </p>
                    {selectedOrder.updated_at && (
                      <p>
                        <span className="text-gray-600 dark:text-gray-400">
                          Updated:
                        </span>{" "}
                        <span className="text-gray-900 dark:text-white">
                          {formatDate(selectedOrder.updated_at)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Change Status */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Update Status
                    </h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        handleDeleteOrder(selectedOrder.id);
                        setSelectedOrder(null);
                      }}
                      className="gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Order
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      ["pending", "awaiting_payment", "confirmed", "shipped", "delivered", "completed", "failed", "cancelled"] as const
                    ).map((status) => (
                      <Button
                        key={status}
                        variant={
                          selectedOrder.status === status
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        disabled={
                          selectedOrder.status === status ||
                          updatingOrderId === selectedOrder.id
                        }
                        onClick={() => {
                          handleUpdateOrderStatus(selectedOrder.id, status);
                          setSelectedOrder({ ...selectedOrder, status });
                        }}
                        className="gap-1.5"
                      >
                        {getStatusIcon(status)}
                        {formatStatus(status)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Product Add/Edit Modal */}
        {isProductModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setIsProductModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8 border border-border shadow-2xl"
            >
              <div className="sticky top-0 flex justify-between items-center p-6 border-b border-border bg-white dark:bg-gray-900 rounded-t-xl z-10">
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  {editingProduct
                    ? editingProduct.isCustom
                      ? "Edit Product (Custom DB)"
                      : "Override Sanity CMS Product"
                    : "Add New Product"}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsProductModalOpen(false)}>
                  ✕
                </Button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Product Name *</label>
                    <Input
                      type="text"
                      placeholder="e.g. Money Magnet Bracelet"
                      value={prodName}
                      onChange={handleNameChange}
                      required
                    />
                  </div>

                  {/* Slug / ID */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Product ID / Slug *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. money-magnet-bracelet"
                      value={prodId}
                      onChange={(e) => !editingProduct && setProdId(slugify(e.target.value))}
                      disabled={!!editingProduct}
                      required
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {editingProduct 
                        ? "Unique identifier cannot be modified after creation." 
                        : "URL-friendly unique identifier. Auto-generated from name."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Stone / Crystal Type</label>
                    <Input
                      type="text"
                      placeholder="e.g. Green Aventurine"
                      value={prodStone}
                      onChange={(e) => setProdStone(e.target.value)}
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Price (₹) *</label>
                    <Input
                      type="number"
                      placeholder="e.g. 1199"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Original Price (₹) - for Strike-through</label>
                    <Input
                      type="number"
                      placeholder="e.g. 2200"
                      value={prodOriginalPrice}
                      onChange={(e) => setProdOriginalPrice(e.target.value)}
                    />
                  </div>

                  {/* Featured */}
                  <div className="flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      id="prodFeatured"
                      checked={prodFeatured}
                      onChange={(e) => setProdFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="prodFeatured" className="text-sm font-medium text-foreground cursor-pointer">
                      Feature on Homepage / Showcase
                    </label>
                  </div>
                </div>

                {/* Categories Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category *</label>
                    <Select
                      value={PREDEFINED_CATEGORIES.some(c => c.name === prodCategory) ? prodCategory : prodCategory ? "custom" : ""}
                      onValueChange={handleCategorySelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PREDEFINED_CATEGORIES.map(c => (
                          <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                        ))}
                        <SelectItem value="custom">Other / Custom Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sub-Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Sub-Category</label>
                    <Select
                      value={
                        PREDEFINED_CATEGORIES.find(c => c.name === prodCategory)?.subCategories.some(s => s.name === prodSubCategory)
                          ? prodSubCategory
                          : prodSubCategory
                            ? "custom"
                            : ""
                      }
                      onValueChange={handleSubCategorySelect}
                      disabled={!prodCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Sub-Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PREDEFINED_CATEGORIES.find(c => c.name === prodCategory)?.subCategories.map(s => (
                          <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                        ))}
                        <SelectItem value="custom">Other / Custom Sub-Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Category/Subcategory text inputs if 'custom' is selected */}
                {(!PREDEFINED_CATEGORIES.some(c => c.name === prodCategory) || 
                  (prodCategory && !PREDEFINED_CATEGORIES.find(c => c.name === prodCategory)?.subCategories.some(s => s.name === prodSubCategory) && prodSubCategory)) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                    {/* Custom Category Input */}
                    {!PREDEFINED_CATEGORIES.some(c => c.name === prodCategory) && (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Custom Category Name *</label>
                        <Input
                          type="text"
                          placeholder="e.g. Healing Spheres"
                          value={prodCategory}
                          onChange={(e) => {
                            setProdCategory(e.target.value);
                            setProdCategorySlug(slugify(e.target.value));
                          }}
                          required
                        />
                      </div>
                    )}
                    
                    {/* Custom Subcategory Input */}
                    {prodCategory && !PREDEFINED_CATEGORIES.find(c => c.name === prodCategory)?.subCategories.some(s => s.name === prodSubCategory) && prodSubCategory !== "" && (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Custom Sub-Category Name</label>
                        <Input
                          type="text"
                          placeholder="e.g. Large Spheres"
                          value={prodSubCategory}
                          onChange={(e) => {
                            setProdSubCategory(e.target.value);
                            setProdSubCategorySlug(slugify(e.target.value));
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Benefit */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Metaphysical Benefit / Description</label>
                  <textarea
                    placeholder="e.g. Attracts wealth, clears mental clutter, and enhances logical thinking"
                    value={prodBenefit}
                    onChange={(e) => setProdBenefit(e.target.value)}
                    className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Product Image Selector */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Product Image *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="flex flex-col gap-2">
                      <div className="relative flex items-center justify-center border-2 border-dashed border-border rounded-lg p-6 bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setProdImageFile(file);
                              setProdImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-center space-y-1">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="text-xs font-medium text-muted-foreground">
                            {prodImageFile ? prodImageFile.name : "Select or drag local image file"}
                          </p>
                        </div>
                      </div>
                      
                      {/* URL option as fallback */}
                      <div className="space-y-1 mt-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Or enter image URL directly:</span>
                        <Input
                          type="text"
                          placeholder="https://example.com/image.jpg"
                          value={prodImage}
                          onChange={(e) => {
                            setProdImage(e.target.value);
                            setProdImageFile(null);
                            setProdImagePreview("");
                          }}
                        />
                      </div>
                    </div>

                    {/* Preview Area */}
                    <div className="flex flex-col items-center justify-center border border-border rounded-lg p-3 bg-muted/5 h-[160px]">
                      {prodImagePreview || prodImage ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={prodImagePreview || prodImage}
                            alt="Preview"
                            className="max-h-[140px] max-w-full object-contain rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full"
                            onClick={() => {
                              setProdImageFile(null);
                              setProdImagePreview("");
                              setProdImage("");
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-muted-foreground">
                          No image selected for preview
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsProductModalOpen(false)}
                    disabled={savingProduct}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingProduct} className="gap-2">
                    {savingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Product"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminPanel;
