import React, { useState } from "react";
import { X, Trash2, ShoppingBag, ArrowRight, Percent, CheckCircle, Tag, Sparkles, MessageSquare, MapPin, AlertCircle, QrCode } from "lucide-react";
import { CartItem, Coupon, UserSession } from "../types";
import { COUPONS } from "../data";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (item: any) => void;
  onRemoveFromCart: (item: any) => void;
  onClearCart: () => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  deliveryAddress: string;
  triggerNotification: (msg: string, type?: "success" | "cart") => void;
  customerSession?: UserSession | null;
  onOpenLogin?: () => void;
  onOrderConfirmed?: (newOrder: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  deliveryAddress,
  triggerNotification,
  customerSession,
  onOpenLogin,
  onOrderConfirmed
}) => {
  const [couponInput, setCouponInput] = useState("");
  const [isCheckoutProgress, setIsCheckoutProgress] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [isPreOrderSlotSelected, setIsPreOrderSlotSelected] = useState(false);

  // Secure payment methods states
  const [selectedPayment, setSelectedPayment] = useState<"COD" | "Razorpay" | "Freecharge">("COD");
  const [paymentStatusState, setPaymentStatusState] = useState<"Pending" | "Paid" | "Success">("Pending");
  const [paymentTxId, setPaymentTxId] = useState<string>("");
  const [isProcessingGateway, setIsProcessingGateway] = useState(false);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [freechargeOpen, setFreechargeOpen] = useState(false);
  
  // Freecharge specific flow states
  const [freechargeOtpSent, setFreechargeOtpSent] = useState(false);
  const [freechargeOtp, setFreechargeOtp] = useState("");
  const [freechargePin, setFreechargePin] = useState("");

  if (!isOpen) return null;

  // Pricing arithmetic
  const subtotal = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const deliveryFee = subtotal > 300 ? 0 : subtotal === 0 ? 0 : 25;
  const platformFee = subtotal === 0 ? 0 : 4;
  
  const hasPreOrderItems = cart.some((it) => it.product.stock <= 0);
  const prebookingCharge = (hasPreOrderItems || isPreOrderSlotSelected) && subtotal > 0 ? 15 : 0; // Pre-order charge applied dynamically
  
  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (subtotal >= appliedCoupon.minSpend) {
      discountAmount = appliedCoupon.code === "FREENEW" ? Math.min(Math.round(subtotal * 0.1), 150) : appliedCoupon.discount;
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee + platformFee + prebookingCharge - discountAmount);

  const handleApplyCouponCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) return;

    const matched = COUPONS.find((c) => c.code === cleanCode);
    if (!matched) {
      triggerNotification("Invalid Coupon Code!", "info" as any);
      return;
    }

    if (subtotal < matched.minSpend) {
      triggerNotification(`Spend at least ₹${matched.minSpend} to use!`, "info" as any);
      return;
    }

    onApplyCoupon(cleanCode);
    setCouponInput("");
  };

  const handleApplyQuickCoupon = (code: string) => {
    const matched = COUPONS.find((c) => c.code === code);
    if (!matched) return;
    
    if (subtotal < matched.minSpend) {
      triggerNotification(`Spend at least ₹${matched.minSpend} to use!`, "info" as any);
      return;
    }

    onApplyCoupon(code);
    triggerNotification(`Voucher ${code} applied successfully!`, "success");
  };

  const generateWhatsAppReceiptMessage = (payTxIdOverride?: string, payStatusOverride?: string) => {
    const itemsList = cart
      .map((item) => `- ${item.product.name} [${item.product.unit}] x ${item.quantity} = ₹${item.product.price * item.quantity}`)
      .join("\n");
    
    const finalTx = payTxIdOverride || paymentTxId || "Verified Gateway Access";
    const paymentStatusToUse = payStatusOverride || (selectedPayment === "COD" ? "Pending" : "Paid");
    const finalPayStatus = selectedPayment === "COD" ? "Cash pending on delivery" : "Paid Securely (" + finalTx + " - " + paymentStatusToUse + ")";

    return `*ANANDWAN SMART SHOP ORDER CONFIRMED* 🌅\n\n` +
      `*Customer Name:* ${customerSession?.name || "Guest"}\n` +
      `*Email/Phone:* ${customerSession?.email || "N/A"} / ${customerSession?.phone || "N/A"}\n` +
      `*Delivery Address:* ${customerSession?.address || deliveryAddress}\n\n` +
      `*Payment Method:* ${selectedPayment}\n` +
      `*Payment Status:* ${finalPayStatus}\n\n` +
      `*Order Details*:\n${itemsList}\n\n` +
      `*Bill Summary:*` +
      `\n- Subtotal: ₹${subtotal}` +
      `\n- Delivery Fee: ${deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}` +
      `\n- Prebooking Charge: ₹${prebookingCharge}` +
      `\n- Platform Fee: ₹${platformFee}` +
      `\n- Coupon Discount: -₹${discountAmount}` +
      `\n*Grand Total Amount: ₹${grandTotal}*\n\n` +
      `Hello Admin, here is my receipt. Please confirm the products on the Anandwan Admin Dashboard. Thank you!`;
  };

  const submitCompiledOrder = (statusStateToOverride?: "Pending" | "Paid" | "Success") => {
    const finalPaymentStatus = statusStateToOverride || (selectedPayment === "COD" ? "Pending" : "Paid");
    
    // Inject the simulated transaction immediately into the order pipeline records!
    if (onOrderConfirmed) {
      const compiledOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: customerSession!.name,
        customerEmail: customerSession!.email,
        customerPhone: customerSession!.phone,
        address: customerSession!.address || deliveryAddress,
        items: cart.map((it) => ({
          productName: it.product.name,
          unit: it.product.unit,
          price: it.product.price,
          quantity: it.quantity,
        })),
        subtotal,
        discount: discountAmount,
        total: grandTotal,
        status: "Received" as const,
        paymentMethod: selectedPayment,
        paymentStatus: finalPaymentStatus,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " Today",
      };
      onOrderConfirmed(compiledOrder);
    }

    setIsCheckoutProgress(true);
    setCheckoutStep(1); // Connecting

    // Step 1: Connecting with partner
    setTimeout(() => {
      setCheckoutStep(2); // Packaged & Hygiene Inspected
    }, 1800);

    // Step 2: Hygiene Inspected
    setTimeout(() => {
      setCheckoutStep(3); // Rider Allocated
    }, 3600);

    // Step 3: Delivered/Ready
    setTimeout(() => {
      setCheckoutStep(4); // Order Confirmed Success Card
    }, 5500);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    
    // Check if user is logged in and possesses secure profile contact fields
    if (!customerSession || !customerSession.email || !customerSession.phone) {
      triggerNotification("Authentication Required! Please verify Google Auth to purchase.", "info" as any);
      if (onOpenLogin) {
        onOpenLogin();
      }
      return;
    }

    if (selectedPayment !== "COD" && paymentStatusState !== "Paid") {
      if (selectedPayment === "Razorpay") {
        setRazorpayOpen(true);
      } else if (selectedPayment === "Freecharge") {
        setFreechargeOpen(true);
      }
      return;
    }
    
    // Auto-open WhatsApp on Proceed to Delivery click for COD
    try {
      const msg = generateWhatsAppReceiptMessage(undefined, "Pending");
      const cleanMsg = encodeURIComponent(msg);
      window.open(`https://wa.me/919422111111?text=${cleanMsg}`, "_blank");
      triggerNotification("Receipt generated and sent to Admin automatically on WhatsApp! ✅", "success");
    } catch (e) {
      console.error("Failed to automatically open WhatsApp popup direct thread:", e);
    }
    
    submitCompiledOrder("Pending");
  };

  const handlePostCheckoutWhatsApp = () => {
    const message = generateWhatsAppReceiptMessage();
    const cleanMsg = encodeURIComponent(message);
    window.open(`https://wa.me/919422111111?text=${cleanMsg}`, "_blank");
    
    // Reset state values
    setSelectedPayment("COD");
    setPaymentStatusState("Pending");
    setPaymentTxId("");
    
    onClearCart();
    setIsCheckoutProgress(false);
    onClose();
  };

  const handleResetCheckout = () => {
    onClearCart();
    setIsCheckoutProgress(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop shade */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => {
          if (!isCheckoutProgress) onClose();
        }}
      />

      {/* Main slide panel */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl z-20 border-l border-gray-100">
        
        {/* Sticky Header block */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <span>My Shopping Basket</span>
            </h3>
            <span className="bg-emerald-50 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-100 leading-none">
              {cart.reduce((ac, c) => ac + c.quantity, 0)} Items
            </span>
          </div>

          {!isCheckoutProgress && (
            <button
              onClick={onClose}
              className="p-1 px-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-950 font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              Close <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Regular Cart Display */}
        {!isCheckoutProgress ? (
          <>
            {/* Scrollable basket contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* ETA status reminder and Delivery mode switcher */}
              {cart.length > 0 && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 text-emerald-950 p-3 rounded-2xl border border-emerald-100 text-xs font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 select-none animate-pulse" />
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Delivering fresh items directly to <strong className="text-emerald-950">{deliveryAddress}</strong></span>
                  </div>

                  {/* Dynamic Pre-Order Mode Selector Card */}
                  <div className="border border-gray-150 rounded-2xl p-3 bg-white space-y-2.5 shadow-xs">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                      Select Delivery Mode & Allocation Settings
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={hasPreOrderItems}
                        onClick={() => setIsPreOrderSlotSelected(false)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                          !isPreOrderSlotSelected && !hasPreOrderItems
                            ? "border-emerald-500 bg-emerald-50/40"
                            : "border-gray-200 bg-gray-50/50 opacity-60"
                        }`}
                      >
                        <span className="block text-xs font-extrabold text-gray-950">Instant Run</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5">15-minute delivery</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsPreOrderSlotSelected(true);
                          if (!hasPreOrderItems) {
                            triggerNotification("Pre-order slot chosen. ₹15 Pre-Order Charges applied.", "info" as any);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor pointer ${
                          isPreOrderSlotSelected || hasPreOrderItems
                            ? "border-amber-500 bg-amber-50/40"
                            : "border-gray-250 bg-gray-100 text-gray-800"
                        }`}
                      >
                        <span className="block text-xs font-extrabold text-gray-950 flex items-center gap-1">
                          Morning Pre-Order
                          {(hasPreOrderItems || isPreOrderSlotSelected) && (
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                          )}
                        </span>
                        <span className="block text-[10px] text-gray-500 mt-0.5">Next cycle (6-8 AM)</span>
                      </button>
                    </div>

                    {hasPreOrderItems ? (
                      <p className="text-[10px] text-amber-850 bg-amber-50/50 p-2 rounded-lg border border-amber-100 font-semibold leading-normal">
                        ⚠️ <strong>Automatic Pre-Order Active</strong>: Some items in your basket are currently out of stock. They will be freshly drawn tonight & delivered in tomorrow's morning cycle!
                      </p>
                    ) : isPreOrderSlotSelected ? (
                      <p className="text-[10px] text-amber-850 bg-amber-50/50 p-2 rounded-lg border border-amber-100 font-semibold leading-normal">
                        ☀️ Selected next day morning block reservation. ₹15 Pre-Order Charge added to bill summary.
                      </p>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Basket list mapping */}
              {cart.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-3xl shadow- inner">
                    🛍️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-800 text-sm">Your basket is totally empty</h4>
                    <span className="text-[11px] text-gray-500 block max-w-64 mt-1">
                      Fresh pasteurized milk, soft cottage cheese, and grocery staples are just a click away!
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3.5 bg-gray-50/50 p-2.5 rounded-2xl border border-gray-150 shadow-xs"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-xl border border-gray-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none flex items-center gap-1.5">
                          Anandwan Smart Shop
                          {item.product.stock <= 0 && (
                            <span className="text-[8px] bg-amber-100 text-amber-850 px-1 rounded border border-amber-200 uppercase font-black tracking-normal">
                              Pre-order item
                            </span>
                          )}
                        </span>
                        <h4 className="font-extrabold text-xs text-gray-900 truncate mt-1">
                          {item.product.name}
                        </h4>
                        <span className="block text-[10px] text-gray-500 font-semibold mt-0.5">
                          {item.product.unit} &middot; ₹{item.product.price} each
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-2.5 bg-white border border-gray-250 py-1 px-2 rounded-lg font-bold text-xs shadow-xs">
                          <button
                            onClick={() => onRemoveFromCart(item.product)}
                            className="hover:bg-slate-100 text-gray-500 hover:text-gray-900 p-0.5 rounded-sm"
                          >
                            <Trash2 className="w-3 h-3 text-rose-500" />
                          </button>
                          <span className="text-gray-800 select-none text-xs font-black">{item.quantity}</span>
                          <button
                            onClick={() => onAddToCart(item.product)}
                            className="hover:bg-slate-100 text-gray-500 hover:text-emerald-800 p-0.5 rounded-sm"
                          >
                            <strong className="text-emerald-700 text-sm leading-none">+</strong>
                          </button>
                        </div>
                        <span className="text-xs font-black text-gray-950">
                          ₹{item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Option to clear all basket */}
                  <div className="text-right">
                    <button
                      onClick={onClearCart}
                      className="text-[10px] font-black text-rose-600 hover:text-rose-800 uppercase tracking-widest hover:underline cursor-pointer"
                    >
                      Clear Entire Basket
                    </button>
                  </div>
                </div>
              )}

              {/* Promo Coupon Selector area */}
              {cart.length > 0 && (
                <div className="border border-emerald-50 rounded-2xl p-3 bg-brand-cream space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-emerald-600" /> Promo Coupons Savings
                    </span>
                    {appliedCoupon && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black border border-emerald-200">
                        Applied Code
                      </span>
                    )}
                  </div>

                  {/* Input form */}
                  {!appliedCoupon ? (
                    <form onSubmit={handleApplyCouponCode} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Try SMARTSHOP100..."
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 placeholder-gray-400 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50 uppercase tracking-wider"
                      />
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Apply Vows
                      </button>
                    </form>
                  ) : (
                    <div className="bg-white border border-emerald-100 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                        <div>
                          <span className="font-extrabold text-emerald-950 font-mono text-xs tracking-wider">
                            {appliedCoupon.code}
                          </span>
                          <span className="block text-[10px] text-emerald-800 font-semibold">
                            {appliedCoupon.title} Saved ₹{discountAmount}!
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={onRemoveCoupon}
                        className="text-[10px] font-black text-rose-500 hover:text-rose-700 uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Quick-choice recommendations chips */}
                  {!appliedCoupon && (
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-widest block">Quick Vouchers</span>
                      <div className="flex flex-wrap gap-1.5">
                        {COUPONS.map((cp) => (
                          <button
                            key={cp.code}
                            onClick={() => handleApplyQuickCoupon(cp.code)}
                            className="bg-white hover:bg-emerald-50 border border-gray-150 hover:border-emerald-200 py-1 px-2.5 rounded-lg text-[10px] font-semibold text-gray-700 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span className="font-mono font-black">{cp.code}</span>
                            <span className="text-[9px] text-gray-400">(Spend ₹{cp.minSpend})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Permanent Bottom checkout action sheet */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-150 bg-white space-y-4 shrink-0">
                {/* Billing Summary description */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold">Item Subtotal</span>
                    <span className="font-bold text-gray-800">₹{subtotal}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-700 font-black flex items-center gap-1">Voucher Discount</span>
                      <span className="font-black text-emerald-700">-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold flex items-center gap-1">
                      Delivery Charge
                      {subtotal > 300 && (
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-extrabold animate-bounce">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-gray-800">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-700 font-extrabold line-through">₹25</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold">Hygiene & Platform Fee</span>
                    <span className="font-bold text-gray-800">₹{platformFee}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                      Pre-order Booking Charge
                      <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-extrabold border border-amber-200">
                        PREBOOK
                      </span>
                    </span>
                    <span className="font-bold text-gray-850 text-amber-800">₹{prebookingCharge}</span>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="border-t border-gray-105 pt-2.5 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Select Payment Method</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 font-black px-1.5 py-0.2 rounded uppercase">SECURE GATEWAY</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPayment("COD");
                          setPaymentStatusState("Pending");
                        }}
                        className={`py-1.5 px-0.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          selectedPayment === "COD"
                            ? "bg-emerald-900 border-emerald-999 text-white shadow-xs"
                            : "bg-gray-50 border-gray-150 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-xs">💵</span>
                        <span className="text-[8.5px] font-black mt-0.5">Cash on Delivery</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPayment("Razorpay");
                          setPaymentStatusState("Pending");
                        }}
                        className={`py-1.5 px-0.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          selectedPayment === "Razorpay"
                            ? "bg-blue-600 border-blue-700 text-white shadow-xs font-semibold"
                            : "bg-gray-50 border-gray-150 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-xs">💳</span>
                        <span className="text-[8.5px] font-black mt-0.5">Razorpay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPayment("Freecharge");
                          setPaymentStatusState("Pending");
                        }}
                        className={`py-1.5 px-0.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          selectedPayment === "Freecharge"
                            ? "bg-orange-500 border-orange-600 text-white shadow-xs font-semibold"
                            : "bg-gray-50 border-gray-150 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-xs">🔴</span>
                        <span className="text-[8.5px] font-black mt-0.5">Freecharge</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center">
                    <span className="text-sm font-extrabold text-gray-950">Grand Total To Pay</span>
                    <span className="text-base font-black text-emerald-800">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Secure MFA Warning for Guests */}
                {(!customerSession || !customerSession.email || !customerSession.phone) && (
                  <div className="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-3 flex gap-2.5 items-start mt-1 animate-pulse">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-extrabold text-amber-900 text-[11px] leading-tight flex items-center gap-1">
                        Google Auth MFA Protection Active
                        <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded uppercase">MFA LOCK</span>
                      </p>
                      <p className="text-[10px] text-amber-850 font-medium leading-normal">
                        Sandbox view is open, but buying requires your <strong>Name, Email, Phone, and Delivery Address</strong> verified via Google Authenticator TOTP scan.
                      </p>
                      {onOpenLogin && (
                        <button
                          type="button"
                          onClick={onOpenLogin}
                          className="bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-md transition-colors cursor-pointer mt-1 flex items-center gap-1"
                        >
                          <QrCode className="w-3 h-3 text-amber-300" />
                          <span>Verify & Link Google Auth</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Main Action trigger */}
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-3 px-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-100 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="text-left font-black leading-none">
                    <span className="block text-[9px] opacity-80 font-bold uppercase tracking-widest">Total Pay</span>
                    <span>₹{grandTotal}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>Proceed to Delivery</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5] animate-pulse" />
                  </div>
                </button>
              </div>
            )}
          </>
        ) : (
          /* High Fidelity Animated Checkout Pipeline Status Screen */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between bg-emerald-950 text-white relative">
            <div>
              <div className="text-center py-6">
                <div className="inline-flex p-3 bg-emerald-900 border border-emerald-800/80 rounded-2xl text-emerald-400 text-3xl mb-3 shadow-lg select-none">
                  🚜
                </div>
                <h4 className="text-base font-black tracking-tight">Anandwan Dispatch Pipeline</h4>
                <p className="text-[11px] text-emerald-300 mt-0.5">Sourcing fresh, handling under direct clean cold chain</p>
              </div>

              {/* Vertical Stepper Pipeline */}
              <div className="mt-8 space-y-6">
                
                {/* Step 1: Connecting with partner */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                      checkoutStep >= 1 ? "bg-emerald-500 border-none text-white animate-bounce" : "border-emerald-800 text-emerald-800"
                    }`}>
                      {checkoutStep > 1 ? "✓" : "1"}
                    </div>
                    <div className="w-0.5 h-12 bg-emerald-900"></div>
                  </div>
                  <div>
                    <h5 className={`text-xs font-extrabold tracking-tight ${checkoutStep >= 1 ? "text-white" : "text-emerald-800"}`}>
                      Transmitting Order Request
                    </h5>
                    <p className="text-[10px] text-emerald-300 leading-normal mt-0.5">
                      Syncing catalog item requests directly with Warora Farm gates.
                    </p>
                  </div>
                </div>

                {/* Step 2: Packaging block */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                      checkoutStep >= 2 ? "bg-emerald-500 border-none text-white animate-bounce" : "border-emerald-800 text-emerald-800"
                    }`}>
                      {checkoutStep > 2 ? "✓" : "2"}
                    </div>
                    <div className="w-0.5 h-12 bg-emerald-900"></div>
                  </div>
                  <div>
                    <h5 className={`text-xs font-extrabold tracking-tight ${checkoutStep >= 2 ? "text-white" : "text-emerald-800"}`}>
                      Clean Cold Room Packing
                    </h5>
                    <p className="text-[10px] text-emerald-300 leading-normal mt-0.5">
                      Sorting items into biodegradable chilled carrier bags for freshness.
                    </p>
                  </div>
                </div>

                {/* Step 3: Rider Dispatched */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                      checkoutStep >= 3 ? "bg-emerald-500 border-none text-white animate-bounce" : "border-emerald-800 text-emerald-800"
                    }`}>
                      {checkoutStep > 3 ? "✓" : "3"}
                    </div>
                    <div className="w-0.5 h-10 bg-emerald-900"></div>
                  </div>
                  <div>
                    <h5 className={`text-xs font-extrabold tracking-tight ${checkoutStep >= 3 ? "text-white" : "text-emerald-800"}`}>
                      Assigning Anandwan Partner
                    </h5>
                    <p className="text-[10px] text-emerald-300 leading-normal mt-0.5">
                      Rider Shekhar Rao dispatched under strict cold storage box container.
                    </p>
                  </div>
                </div>

                {/* Step 4: Finished Confirmation block */}
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                    checkoutStep >= 4 ? "bg-amber-400 border-none text-emerald-950 animate-ping" : "border-emerald-800 text-emerald-800"
                  }`}>
                    ✨
                  </div>
                  <div>
                    <h5 className={`text-xs font-extrabold tracking-tight ${checkoutStep >= 4 ? "text-yellow-300" : "text-emerald-800"}`}>
                      Order Confirmed Directly!
                    </h5>
                    <p className="text-[10px] text-emerald-300 leading-normal mt-0.5">
                      Ready for rapid visual dispatch billing.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Step 4 final success splash */}
            {checkoutStep === 4 ? (
              <div className="bg-white/10 border border-white/10 rounded-2xl p-4 space-y-4 animate-in zoom-in-95 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎉</span>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Order Processed Cleanly!</h4>
                    <span className="text-[10px] text-emerald-350 font-bold block">Grand pay total: ₹{grandTotal}</span>
                  </div>
                </div>
                
                <p className="text-[10.5px] text-yellow-50 leading-relaxed font-semibold">
                  A structured invoice receipt has been automatically generated and triggered to open via WhatsApp for Admin's immediate delivery confirmation on the dashboard! ☀️
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={handlePostCheckoutWhatsApp}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-2 px-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                  >
                    <MessageSquare className="w-4 h-4 fill-white/20" />
                    <span>Resend / Open Receipt</span>
                  </button>
                  <button
                    onClick={handleResetCheckout}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-[11px] py-2 px-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest animate-pulse select-none">
                  Connecting Clean Cold Storage...
                </span>
              </div>
            )}

            {/* Bottom cancel handle */}
            {checkoutStep < 4 && (
              <button
                onClick={() => setIsCheckoutProgress(false)}
                className="w-full text-center text-xs font-bold text-emerald-300/60 hover:text-white uppercase tracking-widest py-2 hover:underline select-none cursor-pointer"
              >
                Abort Processing Session
              </button>
            )}
          </div>
        )}

      </div>

      {/* ================= SIMULATED RAZORPAY GATEWAY OVERLAY ================= */}
      {razorpayOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-55 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-blue-100 flex flex-col justify-between max-h-[90vh]">
            
            {/* Blue Brand Header */}
            <div className="bg-blue-600 p-5 text-white relative">
              <button
                type="button"
                onClick={() => setRazorpayOpen(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight">Razorpay Instant Direct</h4>
                  <p className="text-[10px] text-blue-105 opacity-90 font-medium">Anandwan Smart Portal Hub Integration</p>
                </div>
              </div>
            </div>

            {/* Inner Details */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              {/* Receipt Summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Merchant account</span>
                  <span className="text-emerald-700">VERIFIED ✓</span>
                </div>
                <h5 className="text-xs font-extrabold text-slate-800">Anandwan Farms Dev Hub</h5>
                <div className="flex justify-between items-center pt-2 border-t border-slate-105">
                  <span className="text-xs text-slate-600 font-bold">Total Payment amount</span>
                  <strong className="text-sm font-black text-blue-700">₹{grandTotal}</strong>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">UPI Address or Card Choice</label>
                <div className="relative">
                  <input
                    type="text"
                    defaultValue={customerSession?.phone ? `${customerSession.phone}@paytm` : "customer@okicici"}
                    disabled
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs pl-3 py-2 rounded-xl outline-none font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-[9px] bg-blue-50 text-blue-700 font-extrabold px-1.5 py-0.2 rounded">AUTO-PIN</span>
                </div>
                <p className="text-[9.5px] text-gray-500 leading-normal">
                  Your verified Google Auth number <strong>{customerSession?.phone || "N/A"}</strong> resides as default secure payments key.
                </p>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-2 items-start text-[10px] text-blue-900">
                <span className="mt-0.5">🛡️</span>
                <p className="leading-snug">
                  By executing this test, you authorization a virtual UPI intent request to complete transaction <strong>ORD-REF</strong> securely.
                </p>
              </div>
            </div>

            {/* Bottom Pay Execution button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsProcessingGateway(true);
                  const randomTx = "pay_" + Math.random().toString(36).substring(2, 10).toUpperCase();
                  setPaymentTxId(randomTx);

                  // Auto-open WhatsApp popup right in direct click thread
                  try {
                    const msg = generateWhatsAppReceiptMessage(randomTx, "Paid");
                    const encodeMsg = encodeURIComponent(msg);
                    window.open(`https://wa.me/919422111111?text=${encodeMsg}`, "_blank");
                    triggerNotification(`Receipt generated & sent to Admin automatically! ✅`, "success");
                  } catch (e) {
                    console.error("Auto WhatsApp send failed:", e);
                  }

                  setTimeout(() => {
                    setIsProcessingGateway(false);
                    setPaymentStatusState("Paid");
                    setRazorpayOpen(false);
                    triggerNotification(`Razorpay payment approved! ID: ${randomTx}`, "success");
                    submitCompiledOrder("Paid");
                  }, 1200);
                }}
                disabled={isProcessingGateway}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isProcessingGateway ? "Synthesizing Security handshake..." : `Authorize Pay ₹${grandTotal}`}</span>
              </button>
              <button
                type="button"
                onClick={() => setRazorpayOpen(false)}
                className="w-full text-center text-[10px] font-bold text-gray-400 hover:text-gray-700 uppercase tracking-widest py-1"
              >
                Decline & Cancel Payment
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= SIMULATED FREECHARGE WALLET OVERLAY ================= */}
      {freechargeOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-55 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-orange-100 flex flex-col justify-between max-h-[90vh]">
            
            {/* Orange Brand Header */}
            <div className="bg-orange-500 p-5 text-white relative">
              <button
                type="button"
                onClick={() => setFreechargeOpen(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎒</span>
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight">Freecharge Wallet Power</h4>
                  <p className="text-[10px] text-orange-100 opacity-90 font-medium">Redeeming Direct Wallet Cash Balance</p>
                </div>
              </div>
            </div>

            {/* Inner Details */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              {/* Receipt Summary */}
              <div className="bg-orange-50/50 border border-orange-100/50 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex justify-between items-center text-[9.5px] font-black tracking-widest text-orange-850 uppercase">
                  <span>Freecharge Wallet Services</span>
                  <span>₹750.00 Balance available</span>
                </div>
                <h5 className="text-[11px] text-gray-500 leading-tight">
                  Paying <strong>Anandwan Farms</strong> for wholesome organic products.
                </h5>
                <div className="flex justify-between items-center pt-2 border-t border-orange-100">
                  <span className="text-xs text-slate-800 font-bold">Total amount to deduct</span>
                  <strong className="text-sm font-black text-orange-600">₹{grandTotal}</strong>
                </div>
              </div>

              {!freechargeOtpSent ? (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Registered Wallet Number</span>
                  <input
                    type="text"
                    disabled
                    value={customerSession?.phone || "+91 94221 11111"}
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs pl-3 py-2 rounded-xl outline-none font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFreechargeOtpSent(true);
                      setFreechargeOtp("5839");
                      triggerNotification("Freecharge Wallet authentication dynamic OTP generated!", "success");
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-[10px] py-1.5 rounded-lg"
                  >
                    Request Wallet Verification Code
                  </button>
                </div>
              ) : (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Enter Wallet Code</label>
                      <span className="text-[9.5px] text-orange-600 font-mono font-bold">Code: 5839</span>
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 5839"
                      value={freechargePin}
                      onChange={(e) => setFreechargePin(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-50 border border-slate-200 text-center font-mono font-black text-sm py-1.5 rounded-xl outline-none focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <p className="text-[9.5px] text-gray-500">
                    Wallet balance will be safely unlocked and deducted instantly. No gateway redirect required.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Pay Execution button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!freechargeOtpSent) {
                    triggerNotification("Please click Request Wallet Verification Code first.", "info" as any);
                    return;
                  }
                  if (freechargePin !== "5839") {
                    triggerNotification("Invalid Wallet Verification OTP code. Use 5839.", "error" as any);
                    return;
                  }
                  setIsProcessingGateway(true);
                  const randomTx = "FC_TXN_" + Math.random().toString(36).substring(2, 9).toUpperCase();
                  setPaymentTxId(randomTx);

                  // Auto-open WhatsApp popup right in direct click thread
                  try {
                    const msg = generateWhatsAppReceiptMessage(randomTx, "Paid");
                    const encodeMsg = encodeURIComponent(msg);
                    window.open(`https://wa.me/919422111111?text=${encodeMsg}`, "_blank");
                    triggerNotification(`Receipt generated & sent to Admin automatically! ✅`, "success");
                  } catch (e) {
                    console.error("Auto WhatsApp send failed:", e);
                  }

                  setTimeout(() => {
                    setIsProcessingGateway(false);
                    setPaymentStatusState("Paid");
                    setFreechargeOpen(false);
                    setFreechargeOtpSent(false);
                    setFreechargePin("");
                    triggerNotification(`Freecharge Wallet Pay Authorized! ID: ${randomTx}`, "success");
                    submitCompiledOrder("Paid");
                  }, 1200);
                }}
                disabled={isProcessingGateway || (freechargeOtpSent && !freechargePin)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isProcessingGateway ? "Deducting from Wallet Balance..." : `Pay ₹${grandTotal} with Wallet`}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFreechargeOpen(false);
                  setFreechargeOtpSent(false);
                  setFreechargePin("");
                }}
                className="w-full text-center text-[10px] font-bold text-gray-400 hover:text-gray-700 uppercase tracking-widest py-1"
              >
                Decline & Cancel Payment
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
