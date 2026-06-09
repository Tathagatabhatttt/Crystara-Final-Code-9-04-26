import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ShoppingBag, Calendar, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface Order {
    id: string;
    order_id: string;
    payment_id: string;
    amount: number;
    items: OrderItem[];
    status: "pending" | "completed" | "failed" | "cancelled";
    shipping_address?: {
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
    };
    created_at: string;
    updated_at?: string;
}

const Orders = () => {
    const { user, session, profile } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (!user) {
            navigate("/auth");
            return;
        }
        if (profile?.role === "admin") {
            navigate("/admin");
            return;
        }
        fetchOrders();
    }, [user, profile?.role, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL}/orders/user/history`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }

            const data = await response.json();
            setOrders(data.orders || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load orders");
            toast.error("Failed to load your orders");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
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
        });
    };

    if (!user || profile?.role === "admin") {
        return null;
    }

    return (
        <div className="mt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <ShoppingBag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            My Orders
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        View and track your order history
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

                {/* Loading State */}
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center items-center gap-3 py-20"
                    >
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-lg text-gray-600 dark:text-gray-400">
                            Loading your orders...
                        </span>
                    </motion.div>
                ) : orders.length === 0 ? (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="border-dashed">
                            <CardContent className="pt-12 pb-12 text-center">
                                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No Orders Yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    You haven't placed any orders yet. Start shopping to see your orders here!
                                </p>
                                <Button onClick={() => navigate("/shop")} className="bg-blue-600 hover:bg-blue-700">
                                    Continue Shopping
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    /* Orders Grid */
                    <div className="grid grid-cols-1 gap-6">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader
                                        onClick={() =>
                                            setSelectedOrder(
                                                selectedOrder?.id === order.id ? null : order
                                            )
                                        }
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                    Order #{order.order_id}
                                                </CardTitle>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(order.created_at)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        ₹{Number(order.amount).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(order.status)}>
                                                {order.status.charAt(0).toUpperCase() +
                                                    order.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    {/* Expandable Details */}
                                    {selectedOrder?.id === order.id && (
                                        <CardContent className="pt-0">
                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                                {/* Items */}
                                                <div className="mb-6">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                                        Order Items
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {order.items.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                                            >
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                        {item.name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
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

                                                {/* Shipping Address */}
                                                {order.shipping_address && (
                                                    <div className="mb-6">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                                            Shipping Address
                                                        </h4>
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                                            {order.shipping_address?.street && (
                                                                <p>{order.shipping_address.street}</p>
                                                            )}
                                                            {order.shipping_address?.city && (
                                                                <p>
                                                                    {order.shipping_address.city},{" "}
                                                                    {order.shipping_address.state}{" "}
                                                                    {order.shipping_address.zip}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Payment Info */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                        Payment Details
                                                    </h4>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                        <p>
                                                            <span className="font-medium">Payment ID:</span>{" "}
                                                            {order.payment_id}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Updated:</span>{" "}
                                                            {order.updated_at
                                                                ? formatDate(order.updated_at)
                                                                : formatDate(order.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Orders;
