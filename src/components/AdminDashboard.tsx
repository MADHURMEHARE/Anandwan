import React, { useState, useEffect } from "react";
import { 
  Package, LayoutDashboard, Truck, Settings, Users, Store, Plus, 
  Trash2, Edit3, ArrowUpRight, TrendingUp, CheckCircle, RefreshCcw, LogOut, ArrowLeft, Fuel, ChevronRight, Key, Shield, User, MapPin, Phone, AlertCircle
} from "lucide-react";
import { Product, Order, UserSession } from "../types";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateProductStock: (id: string, newStock: number) => void;
  onUpdateProductPrice: (id: string, newPrice: number) => void;
  onUpdateOrderStatus: (id: string, newStatus: Order["status"], newPaymentStatus?: Order["paymentStatus"]) => void;
  onAddProduct: (newProduct: Product) => void;
  onDeleteProduct: (id: string) => void;
  onClose: () => void;
  onLogOut: () => void;
  userSession?: UserSession | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  onUpdateProductStock,
  onUpdateProductPrice,
  onUpdateOrderStatus,
  onAddProduct,
  onDeleteProduct,
  onClose,
  onLogOut,
  userSession
}) => {
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "catalog" | "sourcing" | "admins">("analytics");
  
  // Create Product control
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("milk");
  const [newProdPrice, setNewProdPrice] = useState(40);
  const [newProdUnit, setNewProdUnit] = useState("500 ml");
  const [newProdStock, setNewProdStock] = useState(15);
  const [newProdBadge, setNewProdBadge] = useState<"Fresh" | "Best Seller" | "Organic" | "Low Stock">("Fresh");

  // Admin access control states (visible & authorized only to the Master Admin)
  const isMasterAdmin = userSession?.email === "madhurmehare27@gmail.com";
  const [usersList, setUsersList] = useState<UserSession[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [adminErr, setAdminErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPhone, setNewAdminPhone] = useState("");
  const [newAdminAddress, setNewAdminAddress] = useState("");

  const fetchUsers = async () => {
    if (!isMasterAdmin) return;
    setIsLoadingUsers(true);
    setAdminErr("");
    try {
      const headers: Record<string, string> = {};
      if (userSession?.token) {
        headers["Authorization"] = `Bearer ${userSession.token}`;
      }
      const response = await fetch(`/api/auth/users?requestorEmail=${encodeURIComponent("madhurmehare27@gmail.com")}`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      } else {
        setAdminErr("Failed to pull registered database users.");
      }
    } catch (e) {
      setAdminErr("Could not establish connection to credentials registry.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isMasterAdmin && activeTab === "admins") {
      fetchUsers();
    }
  }, [activeTab, isMasterAdmin]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      setAdminErr("Administrative authority requires a full name and email identifier.");
      return;
    }
    setAdminErr("");
    setSuccessMsg("");
    
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (userSession?.token) {
      headers["Authorization"] = `Bearer ${userSession.token}`;
    }

    try {
      const response = await fetch("/api/auth/create-admin", {
        method: "POST",
        headers,
        body: JSON.stringify({
          requestorEmail: "madhurmehare27@gmail.com",
          email: newAdminEmail.trim(),
          name: newAdminName.trim(),
          phone: newAdminPhone.trim() || "+91 94221 11111",
          address: newAdminAddress.trim() || "Anandwan Ashram, Warora"
        })
      });

      if (response.ok) {
        await response.json();
        setSuccessMsg(`Administrative credentials provisioned successfully for ${newAdminName}!`);
        // reset
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPhone("");
        setNewAdminAddress("");
        fetchUsers();
      } else {
        const err = await response.json();
        setAdminErr(err.error || "Failed to submit new administrator credentials.");
      }
    } catch (e) {
      setAdminErr("Error connecting to server authentication service.");
    }
  };

  const handleToggleRole = async (targetEmail: string) => {
    setAdminErr("");
    setSuccessMsg("");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (userSession?.token) {
      headers["Authorization"] = `Bearer ${userSession.token}`;
    }

    try {
      const response = await fetch("/api/auth/toggle-role", {
        method: "POST",
        headers,
        body: JSON.stringify({
          requestorEmail: "madhurmehare27@gmail.com",
          targetEmail
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setSuccessMsg(`Account authority for ${updated.name} updated to ${updated.role.toUpperCase()}!`);
        fetchUsers();
      } else {
        const err = await response.json();
        setAdminErr(err.error || "Failed to modify permission level.");
      }
    } catch (e) {
      setAdminErr("Could not update authorization levels.");
    }
  };
  const [newProdImg, setNewProdImg] = useState("https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400");
  const [newProdDesc, setNewProdDesc] = useState("Prepared with top level care from grass-fed Gir Cows at Anandwan farms.");

  // Calculate Metrics
  const totalRevenue = orders.reduce((acc, curr) => curr.status !== "Cancelled" ? acc + curr.total : acc, 0);
  const pendingOrdersCount = orders.filter((o) => ["Received", "Packed", "Dispatched"].includes(o.status)).length;
  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const criticalStockItems = products.filter((p) => p.stock <= 5);

  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const added: Product = {
      id: `p-${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      price: Number(newProdPrice),
      unit: newProdUnit,
      stock: Number(newProdStock),
      image: newProdImg,
      description: newProdDesc,
      rating: 5.0,
      badge: newProdBadge,
      isVeg: true
    };
    
    onAddProduct(added);
    setShowAddForm(false);
    
    // reset
    setNewProdName("");
    setNewProdPrice(40);
    setNewProdStock(15);
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      
      {/* Top Admin Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
              📊
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight leading-none flex items-center gap-1.5">
                Admin Control Deck
                <span className="text-[9px] uppercase font-black tracking-widest text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-0.5 px-2 rounded-full">
                  LIVE HUB
                </span>
              </h2>
              <span className="text-[10px] text-gray-500 font-semibold mt-0.5 block">
                Anandwan Smart Shop Central Headquarters
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 px-4 rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Exit to Storefront
            </button>
            <button
              onClick={onLogOut}
              className="bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-100 p-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Log Out of Admin Cabin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin layout Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar Pane */}
        <div className="space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">CONTROL MENU</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full text-left p-3 rounded-xl font-bold text-xs flex items-center justify-between transition-colors ${
                  activeTab === "analytics"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  Analytics & Visuals
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left p-3 rounded-xl font-bold text-xs flex items-center justify-between transition-colors ${
                  activeTab === "orders"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4" />
                  Pending orders ({pendingOrdersCount})
                </div>
                {pendingOrdersCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[9px] rounded-full px-1.5 py-0.5">
                    Live
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("catalog")}
                className={`w-full text-left p-3 rounded-xl font-bold text-xs flex items-center justify-between transition-colors ${
                  activeTab === "catalog"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  Retail Catalog ({products.length})
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab("sourcing")}
                className={`w-full text-left p-3 rounded-xl font-bold text-xs flex items-center justify-between transition-colors ${
                  activeTab === "sourcing"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4" />
                  Milking Status (Warora)
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {isMasterAdmin && (
                <button
                  onClick={() => setActiveTab("admins")}
                  className={`w-full text-left p-3 rounded-xl font-bold text-xs flex items-center justify-between transition-colors ${
                    activeTab === "admins"
                      ? "bg-amber-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Admin Access Control</span>
                  </div>
                  <span className="bg-amber-500 text-slate-950 font-black text-[8px] rounded px-1 uppercase tracking-wider">
                    MASTER
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Informational Notice card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">⚠️ Sandbox Info</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Any simulated checkout order submitted inside the cart sidebar storefront flows in real-time straight to this Dashboard for management!
            </p>
          </div>
        </div>

        {/* Dynamic Detail Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: ANALYTICS & VISUAL GRAPHS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              
              {/* Core metrics counters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Gross Sales Revenue</span>
                  <strong className="text-xl font-black text-emerald-400">₹{totalRevenue}</strong>
                  <span className="text-[9px] text-emerald-500/80 font-semibold block flex items-center gap-0.5 mt-1">
                    <TrendingUp className="w-3 h-3" /> +14.5% Since Yesterday
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Cumulative orders</span>
                  <strong className="text-xl font-black text-white">{orders.length} orders</strong>
                  <span className="text-[9px] text-slate-500 block font-semibold mt-1">From Warora-Nagpur slots</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Avg Ticket Basket Size</span>
                  <strong className="text-xl font-black text-amber-400">₹{averageOrderValue}</strong>
                  <span className="text-[9px] text-amber-500/80 font-semibold block mt-1">Highly margin optimal</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Critical low stock Items</span>
                  <strong className={`text-xl font-black ${criticalStockItems.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {criticalStockItems.length} items
                  </strong>
                  <span className="text-[9px] text-slate-500 block font-semibold mt-1">Requires immediate refill</span>
                </div>
              </div>

              {/* High fidelity dairy collection SVG charts */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-white">Daily Milk Volume Sourced Trend (Warora Farm Gates)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Grass-fed Cow Milk yield collected at 4 AM daily</p>
                </div>

                {/* SVG Graph Layout */}
                <div className="h-44 w-full bg-slate-900/60 rounded-xl border border-slate-800 p-2 relative flex items-end">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-6 px-1.5 opacity-10 font-mono text-[9px]">
                    <div className="border-b border-white"></div>
                    <div className="border-b border-white"></div>
                    <div className="border-b border-white"></div>
                  </div>

                  {/* Graph Columns bars mapping */}
                  <div className="w-full h-32 flex items-end justify-between px-4 z-10">
                    <div className="flex flex-col items-center gap-1.5 w-1/7">
                      <span className="text-[9px] font-black text-slate-400">140L</span>
                      <div className="w-7 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/50 rounded-t-md h-20 transition-all"></div>
                      <span className="text-[9px] font-bold text-slate-500">Mon</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 w-1/7">
                      <span className="text-[9px] font-black text-slate-400">165L</span>
                      <div className="w-7 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/50 rounded-t-md h-24 transition-all"></div>
                      <span className="text-[9px] font-bold text-slate-500">Tue</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 w-1/7">
                      <span className="text-[9px] font-black text-slate-400">150L</span>
                      <div className="w-7 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/50 rounded-t-md h-22 transition-all"></div>
                      <span className="text-[9px] font-bold text-slate-500">Wed</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 w-1/7">
                      <span className="text-[9px] font-black text-slate-400">180L</span>
                      <div className="w-7 bg-emerald-500/40 hover:bg-emerald-500 border border-emerald-500 rounded-t-md h-28 transition-all"></div>
                      <span className="text-[9px] font-bold text-slate-500">Thu</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 w-1/7">
                      <span className="text-[9px] font-black text-emerald-400">210L</span>
                      <div className="w-7 bg-emerald-500 hover:bg-emerald-400 rounded-t-md h-32 transition-all shadow-lg shadow-emerald-500/20"></div>
                      <span className="text-[9px] font-bold text-slate-400">Fri</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 w-1/7">
                      <span className="text-[9px] font-black text-slate-400">135L</span>
                      <div className="w-7 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/50 rounded-t-md h-18 transition-all"></div>
                      <span className="text-[9px] font-bold text-slate-500">Sat</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 w-1/7">
                      <span className="text-[9px] font-black text-slate-400">120L</span>
                      <div className="w-7 bg-emerald-500/15 hover:bg-emerald-500 border border-emerald-500/50 rounded-t-md h-16 transition-all"></div>
                      <span className="text-[9px] font-bold text-slate-500">Sun</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span>🚀 <strong>Milking peak:</strong> Heavy green grass dietary intake on Thursday optimization.</span>
                  <span className="text-emerald-400 font-extrabold flex items-center gap-0.5"><ArrowUpRight className="w-4 h-4" /> Yield optimal</span>
                </div>
              </div>

              {/* Layout for Critical Warnings and Category Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Critical Stock list */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div>
                    <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">Critical Stock Monitoring</h5>
                    <p className="text-[9.5px] text-slate-500 mt-0.5">Products with low inventory (under 5 units)</p>
                  </div>

                  {criticalStockItems.length === 0 ? (
                    <div className="p-4 bg-emerald-900/10 border border-emerald-800/30 rounded-xl text-center text-xs text-emerald-400">
                      ✨ Excellent! All catalog inventories are healthy.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {criticalStockItems.map((p) => (
                        <div
                          key={p.id}
                          className="bg-slate-900 border border-slate-800/60 p-2.5 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🐄</span>
                            <div>
                              <span className="font-extrabold block text-slate-250 truncate max-w-44">{p.name}</span>
                              <span className="text-[9.5px] text-rose-450 text-rose-500 font-bold">Only {p.stock} remain ({p.unit})</span>
                            </div>
                          </div>
                          
                          {/* Stock trigger control */}
                          <button
                            onClick={() => onUpdateProductStock(p.id, p.stock + 50)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] py-1 px-2.5 rounded shadow-xs"
                          >
                            +50 Refill
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sourcing parameters */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div>
                    <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">Cow Care Parameters</h5>
                    <p className="text-[9.5px] text-slate-500 mt-0.5">Biometric logs from Gir cow sheds</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-xl border border-slate-800/50">
                      <span className="text-slate-400 font-medium">Herd Size:</span>
                      <strong className="text-white">125 Cows (Gir & Sahiwal)</strong>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-xl border border-slate-800/50">
                      <span className="text-slate-400 font-medium">Silo Temperature:</span>
                      <strong className="text-emerald-400">3.8°C (Approved Cold Chain)</strong>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-xl border border-slate-800/50">
                      <span className="text-slate-400 font-medium">Organic Diet:</span>
                      <strong className="text-emerald-400">Alfalfa & Green Maize</strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: LIVE ORDERS MONITORING */}
          {activeTab === "orders" && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-white">Live Customer Order Terminal</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Change status to sync cold chain dispatched partner allocations</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[10px] bg-slate-800 text-slate-400 py-1 px-2.5 rounded-full border border-slate-700">
                    Total {orders.length} orders
                  </span>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-500 max-w-sm mx-auto space-y-3">
                  <div className="text-4xl">🛍️</div>
                  <h5 className="font-extrabold text-sm text-slate-300">No Orders Placed Yet</h5>
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    Trigger a simulated purchase inside the storefront basket sidebar, and watch the order populate here instantly!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 shadow-xs"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800/50 pb-2 gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
                              Order ID: #{order.id} &middot; {order.date}
                            </span>
                            <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase border ${
                              order.paymentStatus === "Paid" || order.paymentStatus === "Success"
                                ? "bg-emerald-500/10 text-emerald-405 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                            }`}>
                              Payment: {order.paymentStatus || "Pending"}
                            </span>
                          </div>
                          <span className="text-xs font-black text-white block mt-0.5">
                            Customer: {order.customerName} ({order.customerEmail}) {order.customerPhone && `• 📞 ${order.customerPhone}`}
                          </span>
                        </div>

                        {/* Status Switcher pill drop-down */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] uppercase text-slate-500 font-bold">Billing Status:</label>
                            <select
                              value={order.paymentStatus || "Pending"}
                              onChange={(e) => onUpdateOrderStatus(order.id, order.status, e.target.value as Order["paymentStatus"])}
                              className="bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded font-bold text-blue-400 focus:outline-hidden cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                              <option value="Success">Success</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] uppercase text-slate-500 font-bold">Status:</label>
                            <select
                              value={order.status}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order["status"], order.paymentStatus)}
                              className="bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded font-bold text-emerald-400 focus:outline-hidden cursor-pointer"
                            >
                              <option value="Received">Received</option>
                              <option value="Packed">Packed</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Purchased products lists */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[9px] uppercase font-black text-slate-500 block">Items Purchased</span>
                          {order.items.map((it, i) => (
                            <div key={i} className="flex justify-between items-center text-[11px] text-slate-300 font-semibold">
                              <span>{it.productName} [{it.unit}] x {it.quantity}</span>
                              <strong className="text-white">₹{it.price * it.quantity}</strong>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-350 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] uppercase font-black text-slate-500 block mb-0.5">Dispatch Coordinates & Gateway</span>
                            <p className="truncate font-bold text-white leading-normal">{order.address}</p>
                            <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                              <span>Method:</span>
                              <span className="font-extrabold text-slate-300 bg-slate-800 px-1.5 py-0.2 rounded uppercase">
                                {order.paymentMethod || "COD"}
                              </span>
                            </p>
                          </div>
                          <div className="flex justify-between border-t border-slate-800/80 pt-1 mt-1 text-[12px] font-black text-emerald-400">
                            <span>Amount summary paid:</span>
                            <span>₹{order.total}</span>
                          </div>
                        </div>
                      </div>

                      {/* Manual verification alerts */}
                      {order.paymentStatus !== "Paid" && order.paymentStatus !== "Success" && (
                        <div className="bg-amber-950/30 border border-amber-950/50 p-2.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <span className="text-[10px] text-amber-250 font-semibold leading-normal">
                            ⚠️ This order uses <strong>{order.paymentMethod || "COD"}</strong> and is pending payment processing confirmation.
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, order.status, "Paid")}
                            className="bg-amber-500 hover:bg-amber-450 text-white font-black text-[9px] px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap cursor-pointer transition-colors"
                          >
                            Verify & Confirm Paid ✓
                          </button>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: RETAIL CATALOG MANAGEMENT */}
          {activeTab === "catalog" && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-white">Interactive Catalog Matrix</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Control pricing, modify remaining stocks instantly</p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-1.5 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" /> {showAddForm ? "Close Drawer" : "Add Brand Product"}
                </button>
              </div>

              {/* Inline Add Product Drawer Form */}
              {showAddForm && (
                <form onSubmit={handleAddNewProductSubmit} className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl p-4 gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  
                  <div className="space-y-1">
                    <label className="text-[9.5px] uppercase font-bold text-slate-400 block">Product Label Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anandwan Pure Cow Ghee"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="bg-slate-950 border border-slate-750 border-slate-700 text-xs text-white rounded p-2 focus:outline-hidden w-full font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] uppercase font-bold text-slate-400 block">Category Sorter</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs text-white rounded p-2 focus:outline-hidden w-full font-semibold"
                    >
                      <option value="milk">Fresh Milk</option>
                      <option value="paneer">Paneer & Curd</option>
                      <option value="butter">Butter & Creams</option>
                      <option value="bread">Bread & Bakery</option>
                      <option value="grocery">Pantry Staples</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] uppercase font-bold text-slate-400 block">Price (INR)</label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-700 text-xs text-white rounded p-2 focus:outline-hidden w-full font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] uppercase font-bold text-slate-400 block">Packaging size / unit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500 ml, 1 kg"
                      value={newProdUnit}
                      onChange={(e) => setNewProdUnit(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs text-white rounded p-2 focus:outline-hidden w-full font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] uppercase font-bold text-slate-400 block">Initial Stock Availability</label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-700 text-xs text-white rounded p-2 focus:outline-hidden w-full font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] uppercase font-bold text-slate-400 block">Badge Designation</label>
                    <select
                      value={newProdBadge}
                      onChange={(e) => setNewProdBadge(e.target.value as any)}
                      className="bg-slate-950 border border-slate-700 text-xs text-white rounded p-2 focus:outline-hidden w-full font-semibold"
                    >
                      <option value="Fresh">Fresh</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="Organic">Organic</option>
                      <option value="Low Stock">Low Stock</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 pt-3 flex gap-2">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 px-6 rounded-lg shadow-xs"
                    >
                      Inject into Catalog Matrix
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="bg-slate-850 hover:bg-slate-800 text-slate-350 py-2 px-4 rounded-lg text-xs"
                    >
                      Dismiss Form
                    </button>
                  </div>

                </form>
              )}

              {/* Product matrix entries list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-extrabold">
                    <tr>
                      <th className="px-4 py-3">Product Specs</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-center">Retail Price</th>
                      <th className="px-4 py-3 text-center">Stock Limit</th>
                      <th className="px-4 py-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-semibold">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-extrabold text-slate-100 block">{p.name}</span>
                            <span className="text-[10px] text-slate-400 block">{p.unit} &middot; {p.badge || "No Tag"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300 capitalize">{p.category}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-slate-100 font-black">₹{p.price}</span>
                            <button
                              onClick={() => {
                                const newP = prompt(`Set new retail price for ${p.name}:`, p.price.toString());
                                if (newP && !isNaN(Number(newP))) {
                                  onUpdateProductPrice(p.id, Number(newP));
                                }
                              }}
                              className="text-[9px] text-emerald-400 font-bold hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`font-black ${p.stock <= 5 ? "text-rose-450 text-rose-500 animate-pulse" : "text-emerald-450 text-emerald-450"}`}>
                              {p.stock} Units
                            </span>
                            <button
                              onClick={() => {
                                const newS = prompt(`Set new stock level for ${p.name}:`, p.stock.toString());
                                if (newS && !isNaN(Number(newS))) {
                                  onUpdateProductStock(p.id, Number(newS));
                                }
                              }}
                              className="text-[9px] text-emerald-400 font-bold hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Do you genuinely want to remove "${p.name}"?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="text-rose-500 hover:text-rose-700 hover:scale-105 p-1 transition-transform"
                            title="Purge product entirely"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: MILKING STATUS & SOURCING PIECE */}
          {activeTab === "sourcing" && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-extrabold text-white">Warora Clean Milking Sourcing Operations</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Continuous logging of biological milking cycles from Gir pens</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Cow Feeding log */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <h5 className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <Fuel className="w-4 h-4" /> Natural Feed Distribution Status
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Green Lucerne Clover:</span>
                      <span className="text-white">Active (Daily 12 kg/cow)</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Organic Mustard Oil Cake:</span>
                      <span className="text-white">Added (Digestion booster)</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Pure Well Fountain Water:</span>
                      <span className="text-white">Continuous free flow</span>
                    </div>
                  </div>
                </div>

                {/* Hygiene report */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <h5 className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> ISO Quality & Adulteration Checks
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Antibiotic Content:</span>
                      <span className="text-emerald-400">0.00% (Not detected)</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Synthetic Thickener Starch:</span>
                      <span className="text-emerald-400">ABSENT</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Somatic Cell Count limit:</span>
                      <span className="text-emerald-400">Optimal (&lt; 20k/ml)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Operations logs notice */}
              <div className="bg-slate-900 p-3.5 rounded-xl text-center text-xs text-slate-400 border border-slate-800 leading-relaxed">
                📢 <strong>Office Note:</strong> Clean Cold silos must hold pasteurized dairy continuously under 4°C. Any delay on driver Shekhar Rao or dispatch partners must be reported inside the instant WhatsApp support terminal immediately.
              </div>

            </div>
          )}

          {/* TAB 5: ADMIN ACCESS CONTROL (MASTER ADMIN ONLY) */}
          {activeTab === "admins" && isMasterAdmin && (
            <div className="space-y-6">
              
              {/* Core header info */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 animate-in fade-in-50 duration-200">
                <div className="flex items-center gap-2.5">
                  <div className="bg-amber-500 rounded-lg p-1.5 text-slate-950">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2 font-sans">
                      Master Access Privileges Hub
                      <span className="text-[9px] uppercase font-mono tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 py-0.5 px-2 rounded-full font-bold">
                        Master Terminal
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-relaxed">
                      Secure backend system console to authorize administrators & revoke system permissions. Under strict guidance.
                    </p>
                  </div>
                </div>

                {adminErr && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{adminErr}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl flex items-center gap-2 font-semibold animate-bounce">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}
              </div>

              {/* Master Admin creation tool */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2.5 font-sans">
                  <Key className="w-4 h-4 text-amber-400" strokeWidth={2.5} />
                  Provision New Administrative Account
                </h5>

                <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Admin Member Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shekhar Rao"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:bg-slate-950 text-xs text-white pl-9 pr-3 py-2 rounded-xl outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-semibold"
                      />
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Primary Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="e.g. shekhar@anandwan.com"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:bg-slate-950 text-xs text-white pl-9 pr-3 py-2 rounded-xl outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-semibold"
                      />
                      <Shield className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Direct Mobile Number (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. +91 94221 11111"
                        value={newAdminPhone}
                        onChange={(e) => setNewAdminPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:bg-slate-950 text-xs text-white pl-9 pr-3 py-2 rounded-xl outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-semibold"
                      />
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Workstation / Residence Address (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Anandwan Ashram, Warora"
                        value={newAdminAddress}
                        onChange={(e) => setNewAdminAddress(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:bg-slate-950 text-xs text-white pl-9 pr-3 py-2 rounded-xl outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-semibold"
                      />
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-1 flex justify-end">
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs py-2 px-5 rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer flex items-center justify-center gap-2 border-none outline-hidden"
                    >
                      <span>Authorize Administrator Account</span>
                      <Shield className="w-4 h-4 text-slate-950" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Users registry list */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <Users className="w-4 h-4 text-emerald-400" />
                    System Accounts Registry Base
                  </h5>
                  <button
                    onClick={fetchUsers}
                    disabled={isLoadingUsers}
                    className="p-1 px-2.5 hover:bg-slate-800 text-[10px] text-slate-450 hover:text-white rounded-lg border border-slate-800 flex items-center gap-1.5 cursor-pointer bg-slate-900 transition-colors"
                  >
                    <RefreshCcw className={`w-3 h-3 ${isLoadingUsers ? "animate-spin" : ""}`} />
                    Refresh Index
                  </button>
                </div>

                {isLoadingUsers && usersList.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs font-semibold font-mono animate-pulse">
                    ⚡ Synchronizing accounts credentials ledger...
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-805 bg-slate-900/10">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-[9.5px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                          <th className="p-3.5">Member Details</th>
                          <th className="p-3.5">Role Authority</th>
                          <th className="p-3.5 font-semibold">Phone & Workstation</th>
                          <th className="p-3.5 text-right font-semibold">Interactive Privileges</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {usersList.map((user) => {
                          const isSelf = user.email.toLowerCase() === "madhurmehare27@gmail.com";
                          return (
                            <tr key={user.email} className="hover:bg-slate-900/30 font-semibold transition-colors duration-150">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8.5 h-8.5 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-400 text-xs font-black border border-slate-705 uppercase select-none">
                                    {user.name.slice(0, 2)}
                                  </div>
                                  <div>
                                    <div className="text-white text-xs font-extrabold leading-tight">{user.name}</div>
                                    <div className="text-[10px] text-slate-450 font-semibold leading-none mt-1 font-mono">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5">
                                {user.role === "admin" ? (
                                  <span className="bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    Admin
                                  </span>
                                ) : (
                                  <span className="bg-emerald-550/10 border border-emerald-550/30 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    Customer
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-[10.5px]">
                                <div className="text-slate-300 font-semibold font-mono">{user.phone || "No Phone"}</div>
                                <div className="text-[9.5px] text-slate-450 font-medium leading-tight mt-0.5">{user.address || "Unspecified"}</div>
                              </td>
                              <td className="p-3.5 text-right">
                                {isSelf ? (
                                  <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                                    🛡️ Master (Self)
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleToggleRole(user.email)}
                                    className={`py-1 px-3 rounded-lg text-[10px] font-black cursor-pointer transition-colors border outline-hidden ${
                                      user.role === "admin"
                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                                        : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                                    }`}
                                  >
                                    {user.role === "admin" ? "Revoke Admin Power" : "Authorize Admin Power"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
