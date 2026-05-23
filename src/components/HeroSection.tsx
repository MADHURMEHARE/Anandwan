import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Flame, Percent, Copy, Sparkles } from "lucide-react";
import { PROMO_BANNERS, COUPONS } from "../data";

interface HeroSectionProps {
  onApplyCoupon: (code: string) => void;
  triggerNotification: (msg: string, type?: "success" | "info" | "cart") => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onApplyCoupon, triggerNotification }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % PROMO_BANNERS.length);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    onApplyCoupon(code);
    triggerNotification(`Coupon "${code}" applied successfully!`, "success");
  };

  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Banner Carousel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Animated Carousel Banner */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden h-[240px] sm:h-[320px] shadow-lg group">
          {/* Slides */}
          {PROMO_BANNERS.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full bg-gradient-to-tr ${banner.gradient} transition-all duration-700 ease-in-out flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 text-white ${
                index === currentSlide ? "opacity-100 translate-x-0 z-10" : "opacity-0 translate-x-12 pointer-events-none z-0"
              }`}
            >
              {/* Slide Text Content */}
              <div className="flex-1 space-y-3.5 text-center md:text-left z-10">
                {banner.tag && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white border border-white/10 shadow-xs">
                    <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                    {banner.tag}
                  </span>
                )}
                
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  {banner.title}
                </h2>
                
                <p className="text-xs sm:text-sm text-yellow-50 font-medium leading-relaxed max-w-md">
                  {banner.subtitle}
                </p>

                <div className="pt-2 flex flex-wrap justify-center md:justify-start items-center gap-3">
                  {banner.discountBadge && (
                    <span className="bg-yellow-400 text-emerald-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md uppercase tracking-wider">
                      {banner.discountBadge}
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-emerald-100 hover:underline cursor-pointer">
                    Swipe for more deals &rarr;
                  </span>
                </div>
              </div>

              {/* Slide Side Image */}
              <div className="w-40 sm:w-56 h-40 sm:h-56 relative shrink-0 hidden md:block mt-4 md:mt-0 z-10">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl transform scale-110"></div>
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover rounded-3xl shadow-xl border-4 border-white/20 transform rotate-2 hover:rotate-0 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Decorative Subtle Background Graphics */}
              <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl p-1 pointer-events-none"></div>
            </div>
          ))}

          {/* Nav buttons */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-emerald-900 border border-white/10 flex items-center justify-center transition-all z-20 shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-emerald-900 border border-white/10 flex items-center justify-center transition-all z-20 shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {PROMO_BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide ? "bg-white w-5" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Promo Coupons Column (Instamart/Zepto Style) */}
        <div className="bg-brand-cream border border-emerald-100 rounded-3xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-100/50 pb-3 mb-4">
              <h3 className="text-gray-900 font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                <span className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg inline-flex block">
                  <Flame className="w-4 h-4 fill-emerald-500 stroke-emerald-500 animate-pulse" />
                </span>
                Active Savings Center
              </h3>
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase">
                Vouchers
              </span>
            </div>

            {/* Coupons map */}
            <div className="space-y-3">
              {COUPONS.map((coupon) => (
                <div
                  key={coupon.code}
                  className="bg-white border border-emerald-50 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:border-emerald-200 transition-colors"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <span className="font-extrabold text-xs text-gray-800 tracking-tight block">
                      {coupon.title}
                    </span>
                    <span className="text-[10px] text-gray-500 block leading-tight">
                      {coupon.description}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className="flex flex-col items-center shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 py-1.5 px-3 rounded-xl transition-all cursor-pointer select-none group"
                  >
                    <span className="font-mono text-xs font-black tracking-wide group-hover:scale-95 transition-transform">
                      {coupon.code}
                    </span>
                    <span className="text-[8px] font-bold text-emerald-600 tracking-wider flex items-center gap-0.5 mt-0.5">
                      <Copy className="w-2 h-2" />
                      Apply
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-500/10 text-emerald-950 p-2.5 rounded-xl text-center text-[10px] font-bold flex items-center justify-center gap-1.5 mt-4 border border-emerald-100/20">
            <span>🛡️ Use coupon codes above at checkout to save instantly.</span>
          </div>
        </div>
      </div>

      {/* Triple Value Assurance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-gray-100 py-4.5">
        <div className="flex items-center gap-3.5 px-3 text-center md:text-left flex-col md:flex-row">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 text-emerald-600 font-extrabold shadow-xs">
            🐄
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-gray-900 tracking-tight">100% Raw A2 Dairy Sourced</h4>
            <span className="text-[10.5px] text-gray-500 font-medium">Naturally richer fats. Freshly sourced daily across Warora & Nagpur farms.</span>
          </div>
        </div>
        <div className="flex items-center gap-3.5 px-3 text-center md:text-left flex-col md:flex-row border-y md:border-y-0 md:border-x border-gray-100 py-3 md:py-0">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 text-emerald-600 font-extrabold shadow-xs">
            ⚡
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-gray-900 tracking-tight">Super Quick Deliveries</h4>
            <span className="text-[10.5px] text-gray-500 font-medium">Blinkit speed delivery at doorstep or direct-counter pickup within 15 Mins.</span>
          </div>
        </div>
        <div className="flex items-center gap-3.5 px-3 text-center md:text-left flex-col md:flex-row">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 text-emerald-600 font-extrabold shadow-xs">
            🍀
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-gray-900 tracking-tight">Strictly Zero Adulteration</h4>
            <span className="text-[10.5px] text-gray-500 font-medium">Certified laboratory testing. No standard starch, thickeners, or preservatives.</span>
          </div>
        </div>
      </div>

    </section>
  );
};
