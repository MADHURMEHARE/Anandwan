import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { CategoriesSection } from "./components/CategoriesSection";
import { ProductCard } from "./components/ProductCard";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { ToastContainer } from "./components/Toast";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { LoginModal } from "./components/LoginModal";
import { AdminDashboard } from "./components/AdminDashboard";

import { PRODUCTS, COUPONS, STORE_REVIEWS } from "./data";
import { Product, CartItem, Coupon, ToastMessage, UserSession, Order } from "./types";
import { Sparkles, Star, ShieldCheck, Heart, ArrowRight } from "lucide-react";

export default function App() {
  // --- Persistent & Core States ---
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("anandwan_smart_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("Anandwan Ashram, Warora");
  const [cartOpen, setCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);
  
  // Clean startup quick-grocery loader state
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Authentication & Admin/Customer session management
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("anandwan_user_session");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  // Stateful copy of products so admin stock/price tweaks reflect instantly!
  const [products, setProducts] = useState<Product[]>([]);

  // Simulated live orders pipeline database
  const [orders, setOrders] = useState<Order[]>([]);

  // Sync basket count with LocalStorage
  useEffect(() => {
    localStorage.setItem("anandwan_smart_cart", JSON.stringify(cart));
  }, [cart]);

  // Sync user session with LocalStorage
  useEffect(() => {
    if (userSession) {
      localStorage.setItem("anandwan_user_session", JSON.stringify(userSession));
    } else {
      localStorage.removeItem("anandwan_user_session");
    }
  }, [userSession]);

  // Dynamically load products and orders from Express Database on Boot
  useEffect(() => {
    setIsAppLoading(true);
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/orders").then((res) => res.json())
    ])
      .then(([dbProducts, dbOrders]) => {
        setProducts(dbProducts);
        setOrders(dbOrders);
        setIsAppLoading(false);
      })
      .catch((err) => {
        console.error("Failed to sync with standard databases, using local backup", err);
        setProducts(PRODUCTS);
        setIsAppLoading(false);
      });
  }, []);

  // --- Dynamic Toast Notifier Push helper ---
  const triggerNotification = (message: string, type: ToastMessage["type"] = "success") => {
    const newId = `${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id: newId, message, type };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Session Managers ---
  const handleLoginSuccess = (session: UserSession, isAdminInitiated = false) => {
    setUserSession(session);
    if (session.role === "admin" && isAdminInitiated) {
      setAdminDashboardOpen(true);
    }
  };

  const handleLogOut = () => {
    setUserSession(null);
    setAdminDashboardOpen(false);
    triggerNotification("Logged out of session. Access switched to Guest.", "info" as any);
  };

  // --- Admin Catalog Updates managers ---
  const handleUpdateProductStock = async (id: string, newStock: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updatedProduct : p))
        );
        triggerNotification("Updated product inventory successfully", "success");
      }
    } catch (err) {
      triggerNotification("Database update failed", "error");
    }
  };

  const handleUpdateProductPrice = async (id: string, newPrice: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice }),
      });
      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updatedProduct : p))
        );
        triggerNotification("Updated product price successfully", "success");
      }
    } catch (err) {
      triggerNotification("Database update failed", "error");
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      if (response.ok) {
        const savedProduct = await response.json();
        setProducts((prev) => [savedProduct, ...prev]);
        triggerNotification(`Successfully injected "${savedProduct.name}" into store catalogs!`, "success");
      }
    } catch (err) {
      triggerNotification("Database insertion failed", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        triggerNotification("Purged product template completely.", "info" as any);
      }
    } catch (err) {
      triggerNotification("Database item purge failed", "error");
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: Order["status"], newPaymentStatus?: Order["paymentStatus"]) => {
    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, paymentStatus: newPaymentStatus }),
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? updatedOrder : o))
        );
        triggerNotification(`Order parameters synchronized successfully!`, "success");
      }
    } catch (err) {
      triggerNotification("Database update failed", "error");
    }
  };

  const handleOrderConfirmed = async (newOrder: Order) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      if (response.ok) {
        const savedOrder = await response.json();
        setOrders((prev) => [savedOrder, ...prev]);
        // Re-sync products catalog as the server decremented stock levels!
        const prodRes = await fetch("/api/products");
        if (prodRes.ok) {
          const dbProds = await prodRes.json();
          setProducts(dbProds);
        }
      }
    } catch (err) {
      console.error("Failed to commit order details to Express database", err);
    }
  };

  // --- Basket Action managers ---
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const idx = prevCart.findIndex((item) => item.product.id === product.id);
      
      // Stock limit constraints check
      const currentQty = idx > -1 ? prevCart[idx].quantity : 0;
      if (product.stock > 0 && currentQty >= product.stock) {
        triggerNotification(`Maximum available stock (${product.stock} items) reached.`, "error");
        return prevCart;
      }

      const updated = [...prevCart];
      if (idx > -1) {
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
      } else {
        updated.push({ product, quantity: 1 });
      }

      triggerNotification(`"${product.name}" added to basket!`, "cart");
      return updated;
    });
  };

  const handleRemoveFromCart = (product: Product) => {
    setCart((prevCart) => {
      const idx = prevCart.findIndex((item) => item.product.id === product.id);
      if (idx === -1) return prevCart;

      const updated = [...prevCart];
      if (updated[idx].quantity > 1) {
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity - 1 };
        triggerNotification(`Decreased "${product.name}" quantity.`, "info" as any);
      } else {
        updated.splice(idx, 1);
        triggerNotification(`"${product.name}" removed from basket.`, "info" as any);
      }
      return updated;
    });
  };

  const handleClearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    triggerNotification("Shopping basket cleared successfully.", "info" as any);
  };

  // --- Coupon Deduct Applicability ---
  const handleApplyCoupon = (code: string) => {
    const found = COUPONS.find((c) => c.code === code);
    if (found) {
      setAppliedCoupon(found);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    triggerNotification("Promo Coupon removed.", "info" as any);
  };

  // --- Dynamic Single Product WhatsApp ordering ---
  const handleSingleOrderWhatsApp = (product: Product) => {
    const message = `*ANANDWAN SMART SHOP INQUIRY* 🥛\n\n` +
      `Hello! I would like to order this item directly:\n` +
      `- *Item:* ${product.name}\n` +
      `- *Vol/Size:* ${product.unit}\n` +
      `- *Price:* ₹${product.price}\n` +
      `- *My Delivery Area:* ${selectedCity}\n\n` +
      `Please let me know if immediate rider dispatch is open today. Thank you!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919422111111?text=${encoded}`, "_blank");
    triggerNotification("Opening WhatsApp chat context...", "success");
  };

  // --- Filter Catalogs computed states ---
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getQuantityInCart = (id: string) => {
    const matched = cart.find((item) => item.product.id === id);
    return matched ? matched.quantity : 0;
  };

  // --- Absolute Loader Splash Screen ---
  if (isAppLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          
          {/* Circular animated spinner */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 border-t-emerald-600 animate-spin"></div>
            <div className="absolute inset-2 bg-emerald-50 rounded-full flex items-center justify-center text-3xl shadow-inner select-none">
              🥛
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-gray-950 tracking-tight leading-none">
              Anandwan Smart Shop
            </h2>
            <span className="text-xs text-emerald-600 font-extrabold tracking-widest uppercase">
              Chilled Freshness Delivered
            </span>
          </div>

          <div className="text-[11px] text-gray-400 font-bold max-w-xs leading-normal pt-2 animate-pulse">
            Inspecting raw dairy temperatures (4°C)... Direct link from organic Warora farms.
          </div>
        </div>
      </div>
    );
  }

  // --- Direct Dashboard Route View ---
  if (adminDashboardOpen && userSession?.role === "admin") {
    return (
      <AdminDashboard
        products={products}
        orders={orders}
        onUpdateProductStock={handleUpdateProductStock}
        onUpdateProductPrice={handleUpdateProductPrice}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onClose={() => setAdminDashboardOpen(false)}
        onLogOut={handleLogOut}
        userSession={userSession}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      
      <div>
        {/* Modern Sticky Navigation */}
        <Navbar
          cart={cart}
          onOpenCart={() => setCartOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          triggerNotification={triggerNotification}
          userSession={userSession}
          onOpenLogin={() => setLoginOpen(true)}
          onLogout={handleLogOut}
          onEnterAdminDashboard={() => setAdminDashboardOpen(true)}
        />

        {/* Hero Slider Promotional Banner Center */}
        <HeroSection
          onApplyCoupon={handleApplyCoupon}
          triggerNotification={triggerNotification}
        />

        {/* Circular Interactive Category Selector Section */}
        <CategoriesSection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Dynamic Catalog Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Category Filter label bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-gray-950 tracking-tight flex items-center gap-2">
                <span>
                  {selectedCategory === "all"
                    ? "In Stock Smart Catalog"
                    : `Fresh ${selectedCategory.toUpperCase()} Selection`}
                </span>
                {searchTerm && (
                  <span className="text-xs bg-gray-150 text-gray-700 font-black rounded-lg px-2 py-0.5 border border-gray-200">
                    Search: "{searchTerm}"
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 font-medium leading-none mt-1">
                Showing {filteredProducts.length} Premium hygiene-compliant items matching criteria
              </p>
            </div>

            {/* Quick quick commerce tag */}
            <div className="text-[11px] font-black tracking-tight text-emerald-800 bg-emerald-50 rounded-xl py-1.5 px-3 border border-emerald-100 w-fit flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 animate-pulse" />
              <span>Free Delivery on orders above ₹300 today!</span>
            </div>
          </div>

          {/* Empty catalog fallback */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto opacity-80">
                🔍
              </div>
              <div>
                <h4 className="font-extrabold text-gray-800 text-sm">No items match your criteria</h4>
                <p className="text-[11.5px] text-gray-500 leading-relaxed max-w-sm mx-auto mt-1">
                  We currently do not stock items matching "{searchTerm}". Please try searching for "milk", "paneer", "curd", or check another category!
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 px-5 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            /* Smart Grid Container with Staggered Entrances */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={(e) => {
                    // Prevent detail modal from launching if the ADD or Quantity selector button is pressed
                    const targetEl = e.target as HTMLElement;
                    if (targetEl.closest("button") || targetEl.closest("a")) {
                      return;
                    }
                    setActiveDetailProduct(product);
                  }}
                  className="cursor-pointer"
                >
                  <ProductCard
                    product={product}
                    quantityInCart={getQuantityInCart(product.id)}
                    onAddToCart={handleAddToCart}
                    onRemoveFromCart={handleRemoveFromCart}
                    onOrderWhatsApp={handleSingleOrderWhatsApp}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Customer Reviews Testimony Carousel */}
          <div className="bg-brand-cream border border-emerald-100/50 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden mt-12">
            <div className="max-w-3xl mx-auto space-y-6 text-center">
              
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-100/80">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span className="text-[10px] font-black text-emerald-950 uppercase tracking-widest">
                  Anandwan Trust Testimonials
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-black text-gray-950 tracking-tight leading-tight">
                Empowering Rural Livelihoods & Sourcing Freshness
              </h3>

              {/* Grid map for 3 beautiful reviews */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {STORE_REVIEWS.map((r) => (
                  <div key={r.id} className="bg-white border border-gray-150 p-4.5 rounded-2xl shadow-xs text-left flex flex-col justify-between">
                    <div>
                      {/* Rating stars */}
                      <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-600 font-semibold leading-relaxed italic">
                        "{r.comment}"
                      </p>
                    </div>
                    
                    <div className="mt-4 border-t border-gray-50 pt-2 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gray-900">{r.name}</span>
                      <span className="text-[10px] font-bold text-gray-400">{r.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust statement unit of Maharogi Sewa Samiti */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-emerald-100 text-xs text-gray-500">
                <span>🌾 Sourced directly from local farmers trained under <strong>Maharogi Sewa Samiti</strong> charity reforms in Warora.</span>
                <span className="hidden sm:inline">&middot;</span>
                <span>Supporting organic smallholder dairy farms since 1949.</span>
              </div>

            </div>
          </div>

        </main>
      </div>

      {/* Trust Footer Outlets */}
      <Footer />

      {/* Slider Slide Cart Sidebar */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        deliveryAddress={selectedCity}
        triggerNotification={triggerNotification}
        customerSession={userSession}
        onOpenLogin={() => setLoginOpen(true)}
        onOrderConfirmed={handleOrderConfirmed}
      />

      {/* Login / Auth Portal modal */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        triggerNotification={triggerNotification}
      />

      {/* Floating Assistance Trigger Widget */}
      <WhatsAppButton />

      {/* Detailed overlay interactive popup */}
      {activeDetailProduct && (
        <ProductDetailModal
          product={activeDetailProduct}
          onClose={() => setActiveDetailProduct(null)}
          quantityInCart={getQuantityInCart(activeDetailProduct.id)}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onOrderWhatsApp={handleSingleOrderWhatsApp}
        />
      )}

      {/* Interactive global Notifications manager UI */}
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />

    </div>
  );
}
