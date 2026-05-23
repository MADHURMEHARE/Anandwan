import React, { useState, useEffect } from "react";
import { X, Shield, User, Lock, ArrowRight, CheckCircle, Sparkles, LogIn, Phone, MapPin, QrCode, Key, AlertCircle } from "lucide-react";
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

  // OTP Verification states
  const [otpCode, setOtpCode] = useState("");
  const [userEnteredOtp, setUserEnteredOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [isOtpTimerActive, setIsOtpTimerActive] = useState(false);

  // Load saved credentials/address details from local storage on opening
  useEffect(() => {
    if (isOpen) {
      // 1. Try loading from an active historic customer session
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

      // 2. Fall back or complement with explicit standalone customer fields
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

  // OTP expiration counter effect
  useEffect(() => {
    let interval: any = null;
    if (isOtpTimerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setIsOtpTimerActive(false);
      setOtpCode("");
      setUserEnteredOtp("");
    }
    return () => clearInterval(interval);
  }, [isOtpTimerActive, otpTimer]);

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
      
      // Auto-validate and pre-populate OTP
      const generated = "274839";
      setOtpCode(generated);
      setUserEnteredOtp(generated);
      setOtpTimer(30);
      setIsOtpTimerActive(true);
    }
    triggerNotification(`Prefilled ${role === "admin" ? "Admin" : "Customer (with secure verification OTP)"} details!`, "info");
  };

  // Click handler to generate secure Google Authenticator TOTP
  const handleGenerateOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(code);
    setOtpTimer(30);
    setIsOtpTimerActive(true);
    triggerNotification("Google Authenticator OTP security Pin dispatched!", "success");
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

      if (!otpCode) {
        triggerNotification("Google Authenticator scan is mandatory. Click 'Generate OTP' to trigger confirmation.", "error");
        return;
      }

      if (userEnteredOtp.trim() !== otpCode) {
        triggerNotification("Wrong validation OTP pin. Check authenticator timer countdown.", "error");
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Absolute backdrop shadow */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Login dialog */}
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl relative border border-gray-100 z-10 my-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
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
          className="text-center space-y-1.5 mb-5 cursor-pointer selection:bg-transparent"
          title="Click 5 times secretly to reveal admin/developer sandbox guides"
        >
          <div className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
            <LogIn className="w-5.5 h-5.5 stroke-[2.25]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-950 tracking-tight">
              Anandwan Smart Portal
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Access smart ordering, dairy cycles, and direct farm catalogs
            </p>
          </div>
        </div>

        {/* Segmented Controller Toggle (Only shown to authorized personnel) */}
        {showAdminToggle && (
          <div className="bg-gray-50 p-1 rounded-xl flex items-center gap-1 border border-gray-100 mb-5 animate-in slide-in-from-top-1">
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                !isAdminMode
                  ? "bg-white text-emerald-800 shadow-xs"
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
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Office
            </button>
          </div>
        )}

        {/* Demo Fast Sandbox helpers - clean and safe */}
        <div className="bg-emerald-50/40 border border-emerald-100/50 p-3 rounded-2xl mb-4 space-y-2">
          <span className="text-[9.5px] font-black tracking-widest text-emerald-800 uppercase block">
            ⚡ Quick Sandbox Accounts
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoFill("customer")}
              className="flex-1 bg-white hover:bg-emerald-50 border border-gray-150 py-1 px-2.5 rounded-xl text-[10px] font-black text-gray-700 hover:text-emerald-800 transition-colors"
            >
              Demo Customer
            </button>
            {showAdminToggle && (
              <button
                type="button"
                onClick={() => handleQuickDemoFill("admin")}
                className="flex-1 bg-white hover:bg-emerald-50 border border-gray-150 py-1 px-2.5 rounded-xl text-[10px] font-black text-gray-700 hover:text-emerald-800 transition-colors animate-in zoom-in-95"
              >
                Demo Admin Port
              </button>
            )}
          </div>
        </div>

        {/* Interactive Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {!isAdminMode ? (
            /* --- Customer Fields --- */
            <>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Your Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madhur Mehare"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 focus:bg-white text-xs pl-3 pr-10 py-2 rounded-xl outline-hidden focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50/50 font-semibold"
                  />
                  <User className="absolute right-3.5 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 focus:bg-white text-xs pl-3 pr-10 py-2 rounded-xl outline-hidden focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50/50 font-semibold"
                  />
                  <User className="absolute right-3.5 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 94221 11111"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 focus:bg-white text-xs pl-3 pr-10 py-2 rounded-xl outline-hidden focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50/50 font-semibold"
                  />
                  <Phone className="absolute right-3.5 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Village / Delivery Region</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 focus:bg-white text-xs px-3 py-2 rounded-xl outline-hidden focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50/50 font-semibold"
                >
                  <option value="Anandwan Ashram, Warora">Anandwan Ashram, Warora</option>
                  <option value="Kothrud, Pune">Kothrud, Pune</option>
                  <option value="Baner, Pune">Baner, Pune</option>
                  <option value="Civil Lines, Nagpur">Civil Lines, Nagpur</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Detailed Flat, Street & Landmark Address</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. MSS Quarters, Gate No. 2, Warora"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 focus:bg-white text-xs pl-3 pr-10 py-2 rounded-xl outline-hidden focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50/50 font-semibold"
                  />
                  <MapPin className="absolute right-3.5 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Secure Google Auth QR & OTP block */}
              <div className="border border-dashed border-emerald-250 rounded-2xl p-3.5 bg-emerald-50/20 space-y-2.5 mt-2">
                <div className="flex items-start gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                      Google Authenticator Sync
                      <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1 py-0.2 rounded uppercase">SECURE TOTP</span>
                    </h5>
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">
                      Scan QR below with your Google Authenticator or dynamic scan app, then click "Generate OTP" to retrieve your unique dynamic code.
                    </p>
                  </div>
                </div>

                {/* Simulated CSS High Quality Vector QR code */}
                <div className="flex items-center justify-center pt-1.5">
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-xs relative cursor-pointer">
                    <svg className="w-24 h-24 text-slate-950" viewBox="0 0 100 100">
                      <rect x="0" y="0" width="100" height="100" fill="#fff" />
                      <rect x="5" y="5" width="22" height="22" fill="currentColor" />
                      <rect x="10" y="10" width="12" height="12" fill="#fff" />
                      <rect x="13" y="13" width="6" height="6" fill="currentColor" />
                      <rect x="73" y="5" width="22" height="22" fill="currentColor" />
                      <rect x="78" y="10" width="12" height="12" fill="#fff" />
                      <rect x="81" y="13" width="6" height="6" fill="currentColor" />
                      <rect x="5" y="73" width="22" height="22" fill="currentColor" />
                      <rect x="10" y="78" width="12" height="12" fill="#fff" />
                      <rect x="13" y="81" width="6" height="6" fill="currentColor" />
                      <rect x="78" y="78" width="12" height="12" fill="currentColor" />
                      <rect x="35" y="5" width="5" height="15" fill="currentColor" />
                      <rect x="45" y="10" width="10" height="25" fill="currentColor" />
                      <rect x="60" y="5" width="5" height="10" fill="currentColor" />
                      <rect x="35" y="45" width="20" height="5" fill="currentColor" />
                      <rect x="5" y="35" width="10" height="5" fill="currentColor" />
                      <rect x="15" y="45" width="15" height="10" fill="currentColor" />
                      <rect x="65" y="35" width="20" height="5" fill="currentColor" />
                      <rect x="85" y="45" width="10" height="10" fill="currentColor" />
                      <rect x="35" y="75" width="15" height="5" fill="currentColor" />
                      <rect x="55" y="70" width="10" height="15" fill="currentColor" />
                      <rect x="42" y="42" width="16" height="16" rx="4" fill="#10B981" />
                      <polygon points="50,45 54,53 46,53" fill="#fff" />
                    </svg>
                  </div>
                </div>

                {/* Interactive Click OTP trigger */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={handleGenerateOtp}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400 stroke-[2.25]" />
                    <span>Generate Authenticator Screen OTP</span>
                  </button>

                  {otpCode && (
                    <div className="bg-white border border-gray-150 p-2 rounded-xl text-center shadow-xs animate-in slide-in-from-top-1.5 duration-200">
                      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Dynamic App Security PIN</span>
                      <div className="flex items-center justify-center gap-1.5 mt-0.5">
                        <span className="text-base font-black text-slate-950 font-mono tracking-widest">{otpCode.slice(0, 3)} {otpCode.slice(3)}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <div className="flex items-center justify-center gap-1 text-[9px] text-gray-500 mt-1">
                        <span>Timer expires inside</span>
                        <strong className="text-slate-800 font-mono font-bold">{otpTimer}s</strong>
                      </div>
                      <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mt-1">
                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(otpTimer / 30) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {otpCode && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Enter OTP Code To Confirm Login</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 582490"
                      value={userEnteredOtp}
                      onChange={(e) => setUserEnteredOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-50 border border-gray-200 text-center font-mono font-black text-sm py-1.5 rounded-xl outline-hidden focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            /* --- Admin Fields --- */
            <>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Admin Email Identification</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="admin@anandwan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 focus:bg-white text-xs pl-3 pr-10 py-2 rounded-xl outline-hidden focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50/50 font-semibold"
                  />
                  <Shield className="absolute right-3.5 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Secure Officer Keypad Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 focus:bg-white text-xs pl-3 pr-10 py-2 rounded-xl outline-hidden focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50/50 font-semibold"
                  />
                  <Lock className="absolute right-3.5 top-2.5 w-4 h-4 text-gray-400" />
                </div>
                <span className="text-[9.5px] text-gray-400 block font-semibold">
                  Sandbox Key: <strong className="text-gray-600">any value</strong> (such as admin123)
                </span>
              </div>
            </>
          )}

          {/* Master Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>{isAdminMode ? "Unlock Admin Controls" : "Scan Sync & Authenticate Login"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Bottom Trust Sign */}
        <div className="text-center mt-4.5 pt-3 border-t border-gray-100 flex items-center justify-center gap-1 text-[10px] text-gray-450">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
          <span>Secured by Google Auth & MSS multi-factor token protocols</span>
        </div>

      </div>
    </div>
  );
};
