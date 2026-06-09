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
  Heart
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
  failedOrders: number;
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, statusFilter, currentPage]);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL}/api/analytics/overview`,
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
        `${import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL}/admin/orders/stats/overview`,
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
        `${import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL}/admin/customers`,
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL}/admin/orders?page=${currentPage}&limit=20`;

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
        `${import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL}/admin/orders/${orderId}`,
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
          <TabsList className="bg-secondary/40 p-1 rounded-xl w-full max-w-2xl grid grid-cols-3 border border-border/40">
            <TabsTrigger value="orders" className="rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingBag className="w-4 h-4" />
              Orders Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              Site Analytics
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6 pt-2">
            {/* Statistics Cards */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12"
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

            {/* Completed Orders */}
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

            {/* Pending Orders */}
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

            {/* Failed Orders */}
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
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{customer.orders.length} orders</Badge>
                          <Badge variant="secondary">{customer.wishlist.length} wishlist</Badge>
                          <Badge variant="secondary">{cartItems.length} cart items</Badge>
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
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Customer Information
                  </h3>
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
                {selectedOrder.shipping_address && (
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
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Update Status
                  </h3>
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
      </main>

      <Footer />
    </div>
  );
};

export default AdminPanel;
