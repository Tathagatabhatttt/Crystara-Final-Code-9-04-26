import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import cors from "cors";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const isVercel = Boolean(process.env.VERCEL);

// Initialize Supabase clientsiup
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ANALYTICS_FILE = isVercel
  ? "/tmp/analytics.json"
  : join(__dirname, "analytics.json");

// Load initial state
let analyticsData = {
  uniqueVisitors: [],
  pageViews: 0,
  productClicks: {},
  cartAdditions: {},
  productMetadata: {}
};

if (fs.existsSync(ANALYTICS_FILE)) {
  try {
    const rawData = fs.readFileSync(ANALYTICS_FILE, "utf-8");
    const parsed = JSON.parse(rawData);
    analyticsData = {
      uniqueVisitors: Array.isArray(parsed.uniqueVisitors) ? parsed.uniqueVisitors : [],
      pageViews: typeof parsed.pageViews === "number" ? parsed.pageViews : 0,
      productClicks: parsed.productClicks && typeof parsed.productClicks === "object" ? parsed.productClicks : {},
      cartAdditions: parsed.cartAdditions && typeof parsed.cartAdditions === "object" ? parsed.cartAdditions : {},
      productMetadata: parsed.productMetadata && typeof parsed.productMetadata === "object" ? parsed.productMetadata : {}
    };
  } catch (err) {
    console.error("Error loading analytics file:", err);
  }
}

function saveAnalytics() {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analyticsData, null, 2));
  } catch (err) {
    console.error("Error saving analytics file:", err);
  }
}

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "https://www.crystara.co.in",
  "https://crystara-frontend.vercel.app",
  "https://crystara-frontend-c0lklf30l-nizxcoders-projects.vercel.app",
  "https://crystara-backend.vercel.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        /\.vercel\.app$/.test(origin) ||
        origin.endsWith("crystara.co.in")
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`), false);
    },
    credentials: true,
  }),
);

// Basic CORS so the Vite dev server (default 5173) can call this API
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  // eslint-disable-next-line no-console
  console.warn(
    "[razorpay] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in environment. " +
      "Create them in your shell or a process manager before starting this server.",
  );
}

// Lazy load Razorpay so the file does not crash if the dependency is missing.
let razorpayInstance = null;

function getRazorpay() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
}

// Create Razorpay order
app.post("/create-order", verifyAuth, async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body || {};

    if (!amount || Number.isNaN(Number(amount))) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    });

    return res.json({
      ...order,
      key_id: keyId
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[razorpay] Error creating order:", error);
    let errMsg = "Failed to create order";
    if (error && typeof error === "object") {
      if (error.error && error.error.description) {
        errMsg = error.error.description;
      } else if (error.description) {
        errMsg = error.description;
      } else if (error.message) {
        errMsg = error.message;
      }
    }
    return res.status(500).json({ error: errMsg });
  }
});

// Verify payment signature
app.post("/verify-payment", verifyAuth, (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ valid: false, error: "Missing payment fields" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      return res.json({ valid: true });
    }

    return res.status(400).json({ valid: false, error: "Invalid signature" });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[razorpay] Error verifying payment:", error);
    return res.status(500).json({ valid: false, error: "Verification failed" });
  }
});

// Public endpoint to bypass email rate limits by registering and auto-confirming users
app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Call Supabase Admin API to create and auto-confirm the user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = data.user;

    // Initialize blank user profile in database
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: user.id,
          email: user.email,
          role: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      console.error("[auth] Profile initialization failed:", profileError);
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error("[auth] Error in backend signup:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

// Middleware to verify auth token
async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// Middleware to verify admin role
async function verifyAdmin(req, res, next) {
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", req.user.id)
      .single();

    if (profile?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: "Access denied" });
  }
}

async function verifyCustomer(req, res, next) {
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", req.user.id)
      .single();

    if (profile?.role === "admin") {
      return res.status(403).json({ error: "Customer access required" });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: "Customer access required" });
  }
}

// Create an order record after successful payment
app.post("/orders", verifyAuth, async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      amount,
      items,
      shippingAddress,
      status = "completed",
    } = req.body;

    if (!orderId || !paymentId || !amount || !items) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          user_id: req.user.id,
          order_id: orderId,
          payment_id: paymentId,
          amount,
          items,
          shipping_address: shippingAddress,
          status,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, order: data[0] });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[orders] Error creating order:", error);
    return res.status(500).json({ error: "Failed to create order record" });
  }
});

// Get user's order history
app.get("/orders/user/history", verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ orders: data });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[orders] Error fetching user orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Track order by tracking ID and email (public endpoint)
app.post("/orders/track", async (req, res) => {
  try {
    const { trackingId, email } = req.body;

    if (!trackingId || !email) {
      return res.status(400).json({ error: "Missing tracking ID or email" });
    }

    const searchId = trackingId.trim().toUpperCase();
    const searchEmail = email.trim().toLowerCase();

    // Query all orders matching the shipping address email directly (avoiding joins)
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("shipping_address->>email", searchEmail);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No order found with these details" });
    }

    // Find the specific order that matches the tracking ID
    const order = orders.find(o => 
      o.id.toUpperCase().startsWith(searchId) || 
      (o.order_id && o.order_id.toUpperCase() === searchId) || 
      (o.order_tracking_id && o.order_tracking_id.toUpperCase() === searchId)
    );

    if (!order) {
      return res.status(404).json({ error: "No order found with these details" });
    }

    // Extract customer name from shipping_address
    const customer_name = order.shipping_address?.name || "Customer";

    return res.json({ 
      order: {
        ...order,
        customer_name
      } 
    });
  } catch (error) {
    console.error("[orders] Error tracking order:", error);
    return res.status(500).json({ error: "Failed to track order" });
  }
});

// Get single order details
app.get("/orders/:id", verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.json({ order: data });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[orders] Error fetching order:", error);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Admin: Get all orders (paginated)
app.get("/admin/orders", verifyAuth, verifyAdmin, async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const userId = req.query.userId;

    let query = supabase
      .from("orders")
      .select("*", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Map orders to inject user_profiles representation from shipping_address
    const mappedOrders = (data || []).map(order => ({
      ...order,
      user_profiles: {
        email: order.shipping_address?.email || "Unknown",
        name: order.shipping_address?.name || "Unknown"
      }
    }));

    return res.json({
      orders: mappedOrders,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[admin] Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Admin: Update order status
app.patch("/admin/orders/:id", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, order: data[0] });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[admin] Error updating order:", error);
    return res.status(500).json({ error: "Failed to update order" });
  }
});

// Admin: Get order statistics
app.get(
  "/admin/orders/stats/overview",
  verifyAuth,
  verifyAdmin,
  async (req, res) => {

    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("status,amount");

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + Number(order.amount), 0),
        completedOrders: orders.filter((o) => o.status === "completed").length,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        confirmedOrders: orders.filter((o) => o.status === "confirmed").length,
        shippedOrders: orders.filter((o) => o.status === "shipped").length,
        deliveredOrders: orders.filter((o) => o.status === "delivered").length,
        awaitingPaymentOrders: orders.filter((o) => o.status === "awaiting_payment").length,
        failedOrders: orders.filter((o) => o.status === "failed").length,
        cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
      };

      return res.json(stats);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[admin] Error fetching stats:", error);
      return res.status(500).json({ error: "Failed to fetch statistics" });
    }
  },
);

// Save onboarding profile
app.post("/onboarding/profile", verifyAuth, async (req, res) => {
  try {
    const {
      name,
      phone,
      address_street,
      address_city,
      address_state,
      address_pincode,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: req.user.id,
          email: req.user.email,
          name,
          phone,
          address_street: address_street || null,
          address_city: address_city || null,
          address_state: address_state || null,
          address_pincode: address_pincode || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, profile: data[0] });
  } catch (error) {
    console.error("[onboarding] Error saving profile:", error);
    return res.status(500).json({ error: "Failed to save profile" });
  }
});

// Check onboarding status
app.get("/onboarding/status", verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("name")
      .eq("user_id", req.user.id)
      .single();

    if (error || !data?.name) {
      return res.json({ isOnboarded: false });
    }

    return res.json({ isOnboarded: true });
  } catch (error) {
    console.error("[onboarding] Error checking status:", error);
    return res.json({ isOnboarded: false });
  }
});

// Get user profile
app.get("/profile", verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json({ profile: data });
  } catch (error) {
    console.error("[profile] Error fetching profile:", error);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile
app.patch("/profile", verifyAuth, async (req, res) => {
  try {
    const {
      name,
      phone,
      address_street,
      address_city,
      address_state,
      address_pincode,
      saved_addresses,
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address_street !== undefined) updates.address_street = address_street;
    if (address_city !== undefined) updates.address_city = address_city;
    if (address_state !== undefined) updates.address_state = address_state;
    if (address_pincode !== undefined)
      updates.address_pincode = address_pincode;
    if (saved_addresses !== undefined)
      updates.saved_addresses = saved_addresses;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("user_id", req.user.id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, profile: data[0] });
  } catch (error) {
    console.error("[profile] Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// Customer: persist current cart so admins can help with active customer orders
app.get("/cart", verifyAuth, verifyCustomer, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("customer_carts")
      .select("items, updated_at")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ items: data?.items || [], updated_at: data?.updated_at || null });
  } catch (error) {
    console.error("[cart] Error fetching cart:", error);
    return res.status(500).json({ error: "Failed to fetch cart" });
  }
});

app.put("/cart", verifyAuth, verifyCustomer, async (req, res) => {
  try {
    const { items } = req.body || {};

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Cart items must be an array" });
    }

    const { data, error } = await supabase
      .from("customer_carts")
      .upsert(
        {
          user_id: req.user.id,
          items,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select("items, updated_at")
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, cart: data });
  } catch (error) {
    console.error("[cart] Error saving cart:", error);
    return res.status(500).json({ error: "Failed to save cart" });
  }
});

// Admin: customer operational details for fulfilment and support
app.get("/admin/customers", verifyAuth, verifyAdmin, async (_req, res) => {
  try {
    const authUsersResult = await supabase.auth.admin.listUsers();

    const [
      profilesResult,
      ordersResult,
      wishlistResult,
      cartsResult,
    ] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("user_id,email,name,phone,role,address_street,address_city,address_state,address_pincode,saved_addresses,created_at,updated_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("wishlist")
        .select("user_id,product_id"),
      supabase
        .from("customer_carts")
        .select("user_id,items,updated_at"),
    ]);

    const firstError =
      profilesResult.error ||
      ordersResult.error;

    if (firstError) {
      return res.status(400).json({ error: firstError.message });
    }

    if (authUsersResult.error) {
      console.warn("[admin] Auth user list unavailable:", authUsersResult.error.message);
    }

    if (wishlistResult.error) {
      console.warn("[admin] Wishlist data unavailable:", wishlistResult.error.message);
    }

    if (cartsResult.error) {
      console.warn("[admin] Cart data unavailable:", cartsResult.error.message);
    }

    const profilesByUser = {};
    (profilesResult.data || []).forEach((profile) => {
      profilesByUser[profile.user_id] = profile;
    });

    const ordersByUser = {};
    (ordersResult.data || []).forEach((order) => {
      if (!ordersByUser[order.user_id]) ordersByUser[order.user_id] = [];
      ordersByUser[order.user_id].push(order);
    });

    const wishlistByUser = {};
    (wishlistResult.error ? [] : wishlistResult.data || []).forEach((row) => {
      if (!wishlistByUser[row.user_id]) wishlistByUser[row.user_id] = [];
      wishlistByUser[row.user_id].push(row.product_id);
    });

    const cartsByUser = {};
    (cartsResult.error ? [] : cartsResult.data || []).forEach((cart) => {
      cartsByUser[cart.user_id] = {
        items: cart.items || [],
        updated_at: cart.updated_at,
      };
    });

    const userIds = new Set();
    (authUsersResult.error ? [] : authUsersResult.data?.users || []).forEach((user) => userIds.add(user.id));
    Object.keys(profilesByUser).forEach((userId) => userIds.add(userId));
    Object.keys(ordersByUser).forEach((userId) => userIds.add(userId));
    Object.keys(wishlistByUser).forEach((userId) => userIds.add(userId));
    Object.keys(cartsByUser).forEach((userId) => userIds.add(userId));

    const authUsersById = {};
    (authUsersResult.error ? [] : authUsersResult.data?.users || []).forEach((user) => {
      authUsersById[user.id] = user;
    });

    const customers = Array.from(userIds)
      .map((userId) => {
        const profile = profilesByUser[userId] || {};
        const authUser = authUsersById[userId];

        return {
          user_id: userId,
          email: profile.email || authUser?.email || "",
          name:
            profile.name ||
            authUser?.user_metadata?.full_name ||
            authUser?.user_metadata?.name ||
            "",
          phone: profile.phone || authUser?.phone || "",
          role: profile.role || "user",
          address_street: profile.address_street || "",
          address_city: profile.address_city || "",
          address_state: profile.address_state || "",
          address_pincode: profile.address_pincode || "",
          saved_addresses: Array.isArray(profile.saved_addresses)
            ? profile.saved_addresses
            : [],
          created_at: profile.created_at || authUser?.created_at || null,
          updated_at: profile.updated_at || authUser?.updated_at || null,
          orders: ordersByUser[userId] || [],
          wishlist: wishlistByUser[userId] || [],
          cart: cartsByUser[userId] || { items: [], updated_at: null },
        };
      })
      .filter((customer) => customer.role !== "admin")
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return res.json({ customers });
  } catch (error) {
    console.error("[admin] Error fetching customers:", error);
    return res.status(500).json({ error: "Failed to fetch customer details" });
  }
});

// Admin: List all admin accounts
app.get("/admin/admins", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, email, name, phone, role, created_at, updated_at")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (profilesError) {
      return res.status(400).json({ error: profilesError.message });
    }

    return res.json({ admins: profiles || [] });
  } catch (error) {
    console.error("[admin] Error listing admins:", error);
    return res.status(500).json({ error: "Failed to list admin users" });
  }
});

// Admin: Create a new user/admin account (auto-confirmed)
app.post("/admin/users/create", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { email, password, role = "admin" } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (role !== "admin" && role !== "user") {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Create user via Supabase admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = data.user;

    // Create/Upsert the user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: user.id,
          email: user.email,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      console.error("[admin] Profile creation failed:", profileError);
      return res.status(500).json({ error: "User created, but profile failed: " + profileError.message });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error("[admin] Error creating user:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
});

// Admin: Delete a user/admin account
app.delete("/admin/users/:userId", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ error: "You cannot delete your own admin account" });
    }

    // Delete user from auth (this will automatically cascade-delete from user_profiles as well)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("[admin] Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

// Analytics tracking endpoint (public)
app.post("/api/analytics/track", (req, res) => {
  try {
    const { eventType, productId, productName, category, image, sessionId } = req.body || {};
    
    if (!eventType) {
      return res.status(400).json({ error: "Missing eventType" });
    }

    if (eventType === "page_view") {
      analyticsData.pageViews = (analyticsData.pageViews || 0) + 1;
      if (sessionId && !analyticsData.uniqueVisitors.includes(sessionId)) {
        analyticsData.uniqueVisitors.push(sessionId);
      }
    } else if (eventType === "product_click") {
      if (productId) {
        analyticsData.productClicks[productId] = (analyticsData.productClicks[productId] || 0) + 1;
        if (productName) {
          analyticsData.productMetadata[productId] = {
            name: productName,
            category: category || "Unknown",
            image: image || ""
          };
        }
      }
    } else if (eventType === "add_to_cart") {
      if (productId) {
        analyticsData.cartAdditions[productId] = (analyticsData.cartAdditions[productId] || 0) + 1;
        if (productName) {
          analyticsData.productMetadata[productId] = {
            name: productName,
            category: category || "Unknown",
            image: image || ""
          };
        }
      }
    }

    saveAnalytics();
    return res.json({ success: true });
  } catch (error) {
    console.error("[analytics] Error tracking event:", error);
    return res.status(500).json({ error: "Failed to track event" });
  }
});

// Analytics overview endpoint (admin only)
app.get("/api/analytics/overview", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    // 1. Fetch wishlist from Supabase
    const { data: wishlistRows, error: wishlistError } = await supabase
      .from("wishlist")
      .select("product_id");

    if (wishlistError) {
      console.error("[analytics] Error fetching wishlist:", wishlistError);
    }

    // Process wishlist counts
    const wishlistCounts = {};
    if (wishlistRows) {
      wishlistRows.forEach(row => {
        const pid = row.product_id;
        if (pid) {
          wishlistCounts[pid] = (wishlistCounts[pid] || 0) + 1;
        }
      });
    }

    // 2. Format product stats
    const formatProductStats = (countMap) => {
      return Object.entries(countMap)
        .map(([id, count]) => {
          const meta = analyticsData.productMetadata[id] || {};
          return {
            id,
            count,
            name: meta.name || id,
            category: meta.category || "Unknown",
            image: meta.image || ""
          };
        })
        .sort((a, b) => b.count - a.count);
    };

    const productClicksList = formatProductStats(analyticsData.productClicks);
    const cartAdditionsList = formatProductStats(analyticsData.cartAdditions);
    const wishlistInterestsList = formatProductStats(wishlistCounts);

    // 3. Return overview stats
    return res.json({
      pageViews: analyticsData.pageViews || 0,
      uniqueVisitors: analyticsData.uniqueVisitors ? analyticsData.uniqueVisitors.length : 0,
      productClicks: productClicksList,
      cartAdditions: cartAdditionsList,
      wishlistInterests: wishlistInterestsList
    });
  } catch (error) {
    console.error("[analytics] Error building overview stats:", error);
    return res.status(500).json({ error: "Failed to fetch analytics overview" });
  }
});

// (Duplicate /auth/signup route removed — handled at line 193)

if (!isVercel) {
  const port = process.env.PORT || 5001;

  app.listen(port, () => {
    console.log(`[razorpay] Server listening on http://localhost:${port}`);
  });
}

export default app;
