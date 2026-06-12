// This is a helper file showing how to integrate order saving with your Razorpay checkout
// Add this to your Cart.tsx or create a separate service file

import { toast } from "sonner";
import { API_URL } from "@/lib/api";

export interface OrderData {
  orderId: string;
  paymentId: string;
  amount: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export const saveOrderToServer = async (
  orderData: OrderData,
  authToken: string,
): Promise<{ success: boolean; order?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save order");
    }

    const result = await response.json();
    return { success: true, order: result.order };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save order";
    console.error("Error saving order:", error);
    return { success: false, error: errorMessage };
  }
};

export const verifyAndSaveOrder = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  orderData: Omit<OrderData, "orderId" | "paymentId">,
  authToken: string,
): Promise<{ success: boolean; order?: any; error?: string }> => {
  try {
    // First, verify the payment signature with your backend
    const verifyResponse = await fetch(
      `${API_URL}/verify-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        }),
      },
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.valid) {
      throw new Error("Payment verification failed");
    }

    // Payment is verified, now save the order
    const completeOrderData: OrderData = {
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      ...orderData,
    };

    return await saveOrderToServer(completeOrderData, authToken);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Verification failed";
    console.error("Error verifying and saving order:", error);
    return { success: false, error: errorMessage };
  }
};

// Example usage in Cart.tsx:
/*
const handlePaymentVerification = async (response: any) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

  const orderData: Omit<OrderData, 'orderId' | 'paymentId'> = {
    amount: Math.round(grandTotal * 100), // Convert to paise
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    shippingAddress: {
      street: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
    },
  };

  const result = await verifyAndSaveOrder(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData,
    session?.access_token || ''
  );

  if (result.success) {
    toast.success('Order placed successfully!');
    clearCart();
    navigate('/orders');
  } else {
    toast.error(result.error || 'Failed to complete order');
  }
};
*/
