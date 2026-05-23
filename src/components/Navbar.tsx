import React, { useState } from "react";
import { Search, ShoppingCart, User, MapPin, SearchSlash, Milk, Star, LogOut, ShieldCheck } from "lucide-react";
import { CartItem, UserSession } from "../types";

interface NavbarProps {
  cart: CartItem[];
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  triggerNotification: (msg: string, type?: "success" | "info" | "cart") => void;
  userSession: UserSession | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onEnterAdminDashboard?: () => void;
}

const LOCAL_AREAS = [
  "Anandwan Ashram, Warora",
  "Kothrud, Pune",
  "Shivajinagar, Pune",
  "Baner, Pune",
  "Hinjewadi, Pune",
  "Civil Lines, Nagpur"
];

export const Navbar: React.FC<NavbarProps> = ({
  cart,
  onOpenCart,
  searchTerm,
  onSearchChange,
  selectedCity,
  onCityChange,
  triggerNotification,
  userSession,
  onOpenLogin,
  onLogout,
  onEnterAdminDashboard
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // Calculate cart metrics
  const totalItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartValue = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

  const handleAreaSelect = (area: string) => {
    onCityChange(area);
    setShowLocationDropdown(false);
    triggerNotification(`Location switched to ${area}`, "success");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-xs">
        {/* Urgent Ticker Banner */}
        <div className="bg-emerald-800 text-white text-xs font-semibold py-1.5 px-4 text-center select-none tracking-wide flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-emerald-900 px-1.5 py-0.5 text-[10px] text-emerald-300 font-extrabold animate-pulse">
            LIVE PREPARATION
          </span>
          <span>🌅 Organic morning deliveries roll out at 6:00 AM daily. Guaranteed freshness under 15 Mins!</span>
        </div>

        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo Brand Block */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => onSearchChange("")}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-100 group-hover:scale-105 transition-transform">
                <Milk className="w-6 h-6 stroke-[2.25]" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-extrabold tracking-tight text-emerald-950 leading-none">
                  Anandwan
                </h1>
                <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
                  Smart Shop
                </span>
              </div>
            </div>

            {/* Location Switcher */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center gap-1.5 text-left bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-100/80 transition-colors text-xs"
              >
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 animate-bounce" />
                <div>
                  <span className="block text-[9px] text-gray-500 font-bold uppercase leading-none">
                    Delivering To
                  </span>
                  <span className="text-gray-800 font-bold truncate max-w-40 block mt-0.5">
                    {selectedCity}
                  </span>
                </div>
              </button>

              {/* Location Selector Dropdown */}
              {showLocationDropdown && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 border-t-emerald-400 border-t-2 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    Select Your Area
                  </div>
                  <div className="max-h-60 overflow-y-auto mt-1 space-y-0.5">
                    {LOCAL_AREAS.map((area) => (
                      <button
                        key={area}
                        onClick={() => handleAreaSelect(area)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                          selectedCity === area
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {area}
                        {selectedCity === area && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick-Search Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search fresh milk, paneer, brown bread, dahi..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 focus:border-emerald-300 focus:bg-white text-sm text-gray-800 placeholder-gray-400 pl-10 pr-8 py-2.5 rounded-2xl outline-hidden font-medium transition-all focus:ring-4 focus:ring-emerald-50"
              />
              <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-3 text-[10px] font-bold text-gray-400 hover:text-gray-700 uppercase bg-gray-200/60 px-1.5 py-0.5 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* User & Cart Buttons Block */}
          <div className="flex items-center gap-3">
            {/* Admin Hub direct access badge if user is admin */}
            {userSession?.role === "admin" && onEnterAdminDashboard && (
              <button
                onClick={onEnterAdminDashboard}
                className="bg-slate-900 border border-emerald-500/35 hover:bg-slate-950 text-emerald-400 font-extrabold text-[11px] py-1.5 px-3 rounded-xl flex items-center gap-1 cursor-pointer select-none animate-pulse"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Cabin</span>
              </button>
            )}

            {/* User Profile Hook */}
            <button
              onClick={() => {
                if (userSession) {
                  setShowUserModal(true);
                } else {
                  onOpenLogin();
                }
              }}
              className="flex items-center gap-1.5 justify-center p-2.5 rounded-2xl text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
              title={userSession ? `${userSession.name}'s Account` : "Log In to Account"}
            >
              <User className="w-5.5 h-5.5" />
              {!userSession ? (
                <span className="text-xs font-bold text-gray-700 pr-1 hidden sm:inline">Sign In</span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 pr-1 hidden sm:inline truncate max-w-16">
                  {userSession.name.split(" ")[0]}
                </span>
              )}
            </button>

            {/* Quick-Commerce Bold Add Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white py-2.5 px-4 rounded-2xl flex items-center gap-2.5 font-bold text-sm shadow-md shadow-emerald-100/80 hover:shadow-lg hover:shadow-emerald-200/50 transition-all select-none"
            >
              <div className="relative shrink-0">
                <ShoppingCart className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-yellow-400 text-emerald-950 font-black text-[10px] rounded-full w-5 h-5 flex items-center justify-center border-2 border-emerald-500 animate-in zoom-in-50">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <div className="text-left leading-none">
                <span className="block text-[9px] opacity-80 font-bold uppercase tracking-wider">
                  My Basket
                </span>
                <span className="text-xs font-black">
                  {totalItemsCount > 0 ? `₹${totalCartValue}` : "Empty"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Extra Location bar */}
        <div className="md:hidden border-t border-gray-50 bg-gray-50/50 py-1.5 px-4 flex items-center justify-between text-[11px] font-bold text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>Delivering: {selectedCity}</span>
          </div>
          <button
            onClick={() => {
              setShowLocationDropdown(!showLocationDropdown);
              // Trigger simple prompt fallback or state toggler
            }}
            className="text-emerald-600 hover:underline"
          >
            Change
          </button>
        </div>

        {/* Mobile quick-changer panel inline */}
        {showLocationDropdown && (
          <div className="md:hidden animate-in fade-in fill-mode-both border-t border-gray-100 p-2 bg-white flex flex-wrap gap-1">
            {LOCAL_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => handleAreaSelect(area)}
                className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold ${
                  selectedCity === area
                    ? "bg-emerald-100 text-emerald-800 border-transparent"
                    : "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Modern Account Modal */}
      {showUserModal && userSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 animate-in zoom-in-95">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-500" /> My Profile
            </h3>
            <p className="text-xs text-gray-500 mt-1">Anandwan Smart Shop Member Hub</p>

            <div className="bg-emerald-50/70 p-4 rounded-2xl mt-4 border border-emerald-100 text-emerald-950 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 border-4 border-white text-white font-extrabold text-xl flex items-center justify-center shadow-md uppercase">
                {userSession.name.charAt(0) + (userSession.name.split(" ")[1]?.charAt(0) || "")}
              </div>
              <h4 className="font-extrabold mt-2.5 text-sm">{userSession.name}</h4>
              <p className="text-[11px] font-semibold text-emerald-800 capitalize">{userSession.role} Member</p>
              
              {userSession.role !== "admin" && (
                <div className="mt-3.5 flex items-center gap-1.5 bg-white text-emerald-900 border border-emerald-200/50 py-1 px-3.5 rounded-full text-xs font-black shadow-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{userSession.smartCoins ?? 0} Smart Coins Saved</span>
                </div>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="text-gray-500 font-semibold">Registered Email</span>
                <span className="font-bold text-gray-800">{userSession.email}</span>
              </div>
              {userSession.role !== "admin" && (
                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-gray-500 font-semibold">Delivery Address</span>
                  <span className="font-bold text-gray-800 truncate max-w-44 text-right">
                    {selectedCity}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-5">
              {userSession.role === "admin" && onEnterAdminDashboard && (
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    onEnterAdminDashboard();
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Enter Admin Dashboard
                </button>
              )}
              <button
                onClick={() => {
                  onLogout();
                  setShowUserModal(false);
                }}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out / Log Out
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close Hub Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
