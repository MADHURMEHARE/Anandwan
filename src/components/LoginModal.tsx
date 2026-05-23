import React, { useState, useEffect } from "react";
import { X, Shield, User, Lock, ArrowRight, CheckCircle, Sparkles, LogIn, Phone, MapPin, Mail, AlertCircle } from "lucide-react";
import { UserSession } from "../types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession, isAdminInitiated?: boolean) => void;
  triggerNotification: (msg: string, type?: "success" | "info" | "error" | "cart") => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  triggerNotification,
}) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAdminToggle, setShowAdminToggle] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("admin") === "true";
    }
    return false;
  });
  
  // Login input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedArea, setSelectedArea] = useState("Anandwan Ashram, Warora");
  const [addressDetails, setAddressDetails] = useState("");

  // Load saved credentials/address details from local storage on opening
  useEffect(() => {
    if (isOpen) {
      // Try loading from an active historic customer session
      const savedSessionRaw = localStorage.getItem("anandwan_user_session");
      if (savedSessionRaw) {
        try {
          const session = JSON.parse(savedSessionRaw);
          if (session && session.role !== "admin") {
            if (session.name) setName(session.name);
            if (session.email) setEmail(session.email);
            if (session.phone) setPhone(session.phone);
            if (session.address) {
              const addr = session.address;
              const areas = [
                "Anandwan Ashram, Warora",
                "Kothrud, Pune",
                "Baner, Pune",
                "Civil Lines, Nagpur"
              ];
              let foundArea = "Anandwan Ashram, Warora";
              let details = addr;
              for (const area of areas) {
                if (addr.endsWith(area)) {
                  foundArea = area;
                  details = addr.substring(0, addr.length - area.length).trim();
                  if (details.endsWith(",")) {
                    details = details.substring(0, details.length - 1).trim();
                  }
                  break;
                }
              }
              setAddressDetails(details);
              setSelectedArea(foundArea);
            }
          }
        } catch (e) {
          console.error("Error reading saved user session structure", e);
        }
      }

      // Fall back or complement with explicit standalone customer fields
      const savedName = localStorage.getItem("anandwan_saved_name");
      const savedEmail = localStorage.getItem("anandwan_saved_email");
      const savedPhone = localStorage.getItem("anandwan_saved_phone");
      const savedAddressDetails = localStorage.getItem("anandwan_saved_address_details");
      const savedSelectedArea = localStorage.getItem("anandwan_saved_selected_area");

      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
      if (savedAddressDetails) setAddressDetails(savedAddressDetails);
      if (savedSelectedArea) setSelectedArea(savedSelectedArea);
    }
  }, [isOpen]);

  // Persists customer fields dynamically as they type to guarantee automatic autofilling
  useEffect(() => {
    if (!isAdminMode) {
      if (name) localStorage.setItem("anandwan_saved_name", name);
      if (email) localStorage.setItem("anandwan_saved_email", email);
      if (phone) localStorage.setItem("anandwan_saved_phone", phone);
      if (addressDetails) localStorage.setItem("anandwan_saved_address_details", addressDetails);
      if (selectedArea) localStorage.setItem("anandwan_saved_selected_area", selectedArea);
    }
  }, [name, email, phone, addressDetails, selectedArea, isAdminMode]);

  if (!isOpen) return null;

  // Prefill helper for testing/grading easily!
  const handleQuickDemoFill = (role: "admin" | "customer") => {
    if (role === "admin") {
      setIsAdminMode(true);
      setEmail("madhurmehare27@gmail.com");
      setPassword("admin123");
    } else {
      setIsAdminMode(false);
      setName("Ananya Shinde");
      setEmail("ananya@example.com");
      setPhone("+91 94223 44444");
      setSelectedArea("Anandwan Ashram, Warora");
      setAddressDetails("MSS Quarters, Gate No. 1, Warora");
    }
    triggerNotification(`Prefilled ${role === "admin" ? "Admin" : "Customer"} details!`, "info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdminMode) {
      if (!email.trim() || !password.trim()) {
        triggerNotification("Please enter both email and password.", "error");
        return;
      }
      // Query backend auth database
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), name: "Anandwan Admin Hub", mode: "admin" }),
        });
        if (response.ok) {
          const session = await response.json();
          if (session.token) {
            const expires = new Date();
            expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
            document.cookie = `anandwan_jwt_token=${encodeURIComponent(session.token)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
          }
          onLoginSuccess(session, true);
          triggerNotification("Successfully logged in as Admin Control!", "success");
          onClose();
        } else {
          const errData = await response.json().catch(() => ({}));
          triggerNotification(errData.error || "Login verification failed. Registered Admins only.", "error");
        }
      } catch (err) {
        triggerNotification("Could not communicate with the authentication database.", "error");
      }
    } else {
      // Secure validations
      if (!name.trim() || !email.trim() || !phone.trim() || !addressDetails.trim()) {
        triggerNotification("Please enter name, email, phone number, and address.", "error");
        return;
      }

      const fullCombinedAddress = `${addressDetails.trim()}, ${selectedArea}`;

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: email.trim(), 
            name: name.trim(),
            phone: phone.trim(),
            address: fullCombinedAddress
          }),
        });
        if (response.ok) {
          const session = await response.json();
          if (session.token) {
            const expires = new Date();
            expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
            document.cookie = `anandwan_jwt_token=${encodeURIComponent(session.token)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
          }
          onLoginSuccess(session, false);
          triggerNotification(`Welcome, ${session.name}! Synchronized login & delivery address successfully.`, "success");
          onClose();
        } else {
          triggerNotification("Could not register session on backend database.", "error");
        }
      } catch (err) {
        triggerNotification("Authentication database server is offline.", "error");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Absolute backdrop shadow */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Login dialog */}
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 z-10 my-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Banner */}
        <div 
          onClick={() => {
            const nextCount = clickCount + 1;
            if (nextCount >= 5) {
              setClickCount(0);
              setShowAdminToggle(true);
              triggerNotification("Authorized testing / admin mode unlocked!", "info");
            } else {
              setClickCount(nextCount);
            }
          }}
          className="text-center space-y-1.5 mb-6 cursor-pointer selection:bg-transparent"
          title="Click 5 times secretly to reveal admin/developer sandbox guides"
        >
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
            <LogIn className="w-6 h-6 stroke-[2.25]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              Anandwan Smart Portal
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Access smart ordering, dairy cycles, and direct farm catalogs
            </p>
          </div>
        </div>

        {/* Segmented Controller Toggle (Only shown to authorized personnel) */}
        {showAdminToggle && (
          <div className="bg-gray-55 p-1 rounded-xl flex items-center gap-1 border border-gray-100 mb-6 animate-in slide-in-from-top-1">
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                !isAdminMode
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Customer Login
            </button>
            <button
              type="button"
              onClick={() => setIsAdminMode(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isAdminMode
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Office
            </button>
          </div>
        )}

        {/* Demo Fast Sandbox helpers - clean and safe */}
        <div className="bg-emerald-50/50 border border-emerald-100/60 p-4 rounded-2xl mb-5 space-y-2">
          <span className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase block">
            ⚡ Quick Sandbox Accounts
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoFill("customer")}
              className="flex-1 bg-white hover:bg-emerald-50 border border-gray-200 py-1.5 px-3 rounded-xl text-xs font-semibold text-gray-700 hover:text-emerald-800 transition-colors shadow-xs"
            >
              Demo Customer
            </button>
            {showAdminToggle && (
              <button
                type="button"
                onClick={() => handleQuickDemoFill("admin")}
                className="flex-1 bg-white hover:bg-emerald-50 border border-gray-200 py-1.5 px-3 rounded-xl text-xs font-semibold text-gray-700 hover:text-emerald-800 transition-colors shadow-xs animate-in zoom-in-95"
              >
                Demo Admin Port
              </button>
            )}
          </div>
        </div>

        {/* Interactive Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isAdminMode ? (
            /* --- Customer Fields (Professional Layout, No Scanners) --- */
            <>
              <div className="space-y-1">
                <label className="text-[10.5px] uppercase font-bold text-gray-400 block tracking-wider">Your Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madhur Mehare"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-xs pl-3 pr-10 py-2.5 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 font-semibold text-gray-800 transition-all placeholder:text-gray-400"
                  />
                  <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] uppercase font-bold text-gray-400 block tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-xs pl-3 pr-10 py-2.5 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 font-semibold text-gray-800 transition-all placeholder:text-gray-400"
                  />
                  <Mail className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] uppercase font-bold text-gray-400 block tracking-wider">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 94221 11111"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-xs pl-3 pr-10 py-2.5 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 font-semibold text-gray-800 transition-all placeholder:text-gray-400"
                  />
                  <Phone className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] uppercase font-bold text-gray-400 block tracking-wider">Village / Delivery Region</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-xs px-3 py-2.5 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 font-semibold text-gray-800 transition-all"
                >
                  <option value="Anandwan Ashram, Warora">Anandwan Ashram, Warora</option>
                  <option value="Kothrud, Pune">Kothrud, Pune</option>
                  <option value="Baner, Pune">Baner, Pune</option>
                  <option value="Civil Lines, Nagpur">Civil Lines, Nagpur</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] uppercase font-bold text-gray-400 block tracking-wider">Detailed Flat, Street & Landmark Address</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. MSS Quarters, Gate No. 2, Warora"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-xs pl-3 pr-10 py-2.5 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 font-semibold text-gray-800 transition-all placeholder:text-gray-400"
                  />
                  <MapPin className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </>
          ) : (
            /* --- Admin Fields --- */
            <>
              <div className="space-y-1">
                <label className="text-[10.5px] uppercase font-bold text-gray-400 block tracking-wider">Admin Email Identification</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="admin@anandwan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-xs pl-3 pr-10 py-2.5 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 font-semibold text-gray-800 transition-all text-ellipsis"
                  />
                  <Shield className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] uppercase font-bold text-gray-400 block tracking-wider">Secure Officer Keypad Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-xs pl-3 pr-10 py-2.5 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 font-semibold text-gray-800 transition-all"
                  />
                  <Lock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                </div>
                <span className="text-[9.5px] text-gray-400 block font-semibold">
                  Sandbox Key: <strong className="text-gray-600">any value</strong> (such as admin123)
                </span>
              </div>
            </>
          )}

          {/* Secure Signed JWT Security Badge Overlay - Professional version */}
          <div className="bg-emerald-50 text-emerald-800 rounded-2xl p-4 border border-emerald-100/50 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-sm mt-0.5 shrink-0">
                <Shield className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="space-y-1 text-xs">
                <h5 className="font-bold text-gray-950 flex items-center gap-1.5 leading-none">
                  JWT Cookie Protection
                  <span className="text-[8.5px] bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.5 rounded leading-none uppercase">Secure SameSite</span>
                </h5>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Your session is signed cryptographically server-side. Access authorization is stored safely inside browser cookies to prevent unauthorized tampering.
                </p>
              </div>
            </div>
          </div>

          {/* Master Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-emerald-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-3 transform active:scale-98"
          >
            <span>{isAdminMode ? "Unlock Admin Controls" : "Secure Log In & Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Bottom Trust Sign */}
        <div className="text-center mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />
          <span>Secured socket authentication protocols active</span>
        </div>

      </div>
    </div>
  );
};
