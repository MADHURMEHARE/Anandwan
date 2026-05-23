import React from "react";
import { Phone, Mail, Clock, MapPin, Milk, MessageSquare, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="bg-gray-950 text-white mt-12 border-t border-gray-800">
      
      {/* Upper informational area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand statement column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-505 bg-emerald-500 flex items-center justify-center text-white">
              <Milk className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-base font-extrabold tracking-tight">Anandwan Smart Shop</h4>
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">Organic Dairy & Staples</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-semibold">
            Bringing pristine milk purity and high-grade organic cold-pressed staples back to modern families. From grass-fed cow pens straight to your dining table under absolute strict cold-chains.
          </p>
          <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400 font-extrabold bg-emerald-950/20 py-1.5 px-3 rounded-lg border border-emerald-900 w-fit">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>ISO 9001:2015 Hygiene Certified</span>
          </div>
        </div>

        {/* Categories / Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-gray-400 font-extrabold">Operating Hours</h4>
          <ul className="space-y-2.5 text-xs font-semibold text-gray-300">
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>🌅 Morning Deliveries: 6 AM - 9 AM</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>🌌 Daily Operations: 6 AM - 10 PM IST</span>
            </li>
            <li className="flex items-center gap-2 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Open 365 Days (Sundays included)</span>
            </li>
          </ul>
        </div>

        {/* Physical Outlet Coordinates */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-gray-400 font-extrabold">Farm Hub & Store Outlets</h4>
          <ul className="space-y-3 text-xs font-medium text-gray-350">
            <li className="flex gap-2">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white block text-xs">Primary Farm Hub:</strong>
                Anandwan Dairy Gate, Warora, Chandrapur, MH - 442914
              </span>
            </li>
            <li className="flex gap-2">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white block text-xs">Pune Distribution Center:</strong>
                Shop 4, DP Road, Near Kothrud Bus Depot, Pune - 411038
              </span>
            </li>
          </ul>
        </div>

        {/* Contact Coordinates / WhatsApp help */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-wider text-gray-400 font-extrabold">Help & Direct Support</h4>
          <ul className="space-y-2.5 text-xs font-semibold text-gray-300">
            <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
              <Phone className="w-4 h-4 text-emerald-400" />
              <a href="tel:+919422111111" className="hover:underline">+91 94220 11111</a>
            </li>
            <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
              <Mail className="w-4 h-4 text-emerald-400" />
              <a href="mailto:support@anandwansmartshop.com" className="hover:underline">support@anandwan.org</a>
            </li>
          </ul>

          <div className="pt-2">
            <a
              href="https://wa.me/919422111111"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl shadow-md transition-all select-none"
            >
              <MessageSquare className="w-4 h-4 fill-white/15" />
              <span>WhatsApp Live Help Desk</span>
            </a>
          </div>
        </div>

      </div>

      {/* Down payment badges and legal copyright info */}
      <div className="border-t border-gray-900 bg-black/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[10.5px] text-gray-500 font-semibold">
              &copy; {new Date().getFullYear()} Anandwan Smart Shop (A Unit of Maharogi Sewa Samiti, Anandwan). All Rights Reserved.
            </p>
            <span className="text-[10px] text-gray-600 block mt-0.5">
              Developed securely complying with clean food grade standards.
            </span>
          </div>

          {/* Secure Payment Badges */}
          <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 p-1.5 rounded-xl">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2">Accepted:</span>
            <div className="flex gap-1">
              <span className="text-[9px] font-black tracking-tighter bg-white/5 border border-white/5 text-gray-400 px-1.5 py-0.5 rounded">UPI</span>
              <span className="text-[9px] font-black tracking-tighter bg-white/5 border border-white/5 text-gray-400 px-1.5 py-0.5 rounded">GPAY</span>
              <span className="text-[9px] font-black tracking-tighter bg-white/5 border border-white/5 text-gray-400 px-1.5 py-0.5 rounded">CARDS</span>
              <span className="text-[9px] font-black tracking-tighter bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">PAY ON DELIVERY</span>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};
