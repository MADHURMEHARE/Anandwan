import React from "react";
import { X, Star, Calendar, ShieldCheck, ShoppingBag, MessageSquare, Milk } from "lucide-react";
import { Product } from "../types";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  quantityInCart: number;
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (p: Product) => void;
  onOrderWhatsApp: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
  onOrderWhatsApp,
}) => {
  if (!product) return null;

  // Nutritional elements calculation mock
  const isDairy = ["milk", "paneer", "butter"].includes(product.category);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      {/* Backdrop trigger */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main card box */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10 border border-gray-150 p-5 sm:p-7 flex flex-col md:flex-row gap-6 animate-in zoom-in-95">
        
        {/* Absolute top close handler */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-50 hover:bg-gray-105 hover:bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-950 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Left column: Visual illustration */}
        <div className="w-full md:w-1/2 flex flex-col gap-3">
          <div className="relative h-60 sm:h-72 bg-gray-55 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 bg-emerald-600 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-md border border-emerald-500/10 tracking-widest shadow-md">
                {product.badge}
              </span>
            )}
          </div>

          {/* Quick trust assurances chips */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 p-2 rounded-xl text-center border border-emerald-100/50">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Shelf Life</span>
              <strong className="text-xs text-gray-800 tracking-tight">
                {isDairy ? "1-3 Days" : "15-30 Days"}
              </strong>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl text-center border border-emerald-100/50">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Cold Chain</span>
              <strong className="text-xs text-gray-800 tracking-tight">Assured 4°C</strong>
            </div>
          </div>
        </div>

        {/* Right column: Specs list, Cart, WhatsApp ordering */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header tags */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Pure Anandwan Premium</span>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-950 tracking-tight leading-snug mt-1 border-b border-gray-100 pb-2">
                {product.name}
              </h3>
            </div>

            {/* Description note */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] uppercase font-black tracking-widest text-gray-400 block">Product Profile</span>
              <p className="text-xs text-text-muted text-gray-600 leading-relaxed font-semibold">
                {product.description}
              </p>
            </div>

            {/* Simulated nutritional ingredients list for dairy products */}
            {isDairy && (
              <div className="bg-brand-cream border border-emerald-100 rounded-2xl p-3 space-y-1.5">
                <span className="text-[10px] font-extrabold text-emerald-950 flex items-center gap-1">
                  <Milk className="w-3.5 h-3.5 text-emerald-600" /> Nutritional Metrics (per 100ml / g)
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                  <div className="bg-white border border-emerald-100/40 p-1 rounded-lg">
                    <span className="text-gray-400 block font-bold">Natural Fats</span>
                    <strong className="text-gray-800">4.8g</strong>
                  </div>
                  <div className="bg-white border border-emerald-100/40 p-1 rounded-lg">
                    <span className="text-gray-400 block font-bold">Proteins</span>
                    <strong className="text-gray-800">3.4g</strong>
                  </div>
                  <div className="bg-white border border-emerald-100/40 p-1 rounded-lg">
                    <span className="text-gray-400 block font-bold">Calcium</span>
                    <strong className="text-gray-800">120mg</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Rating or safety certifications */}
            <div className="flex items-center gap-4.5 border-t border-b border-gray-100 py-2 text-xs">
              {product.rating && (
                <span className="flex items-center gap-1 text-gray-700 font-extrabold">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{product.rating} (350+ votes)</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-emerald-700 font-extrabold" title="Verified lab safety and hygiene standards compliance">
                <ShieldCheck className="w-4 h-4" />
                <span>Lab Hygiene Verified</span>
              </span>
            </div>

          </div>

          {/* Checkout controls section block */}
          <div className="mt-8 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase leading-none">Net Pricing</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-black text-gray-950">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-500 font-bold">Pack content size: {product.unit}</span>
            </div>

            {/* Buttons Row */}
            <div className="flex gap-2.5">
              
              {/* Add Cart handle */}
              {quantityInCart > 0 ? (
                <div className={`flex-1 ${product.stock <= 0 ? "bg-amber-600 shadow-amber-100" : "bg-emerald-600 shadow-emerald-100"} text-white rounded-2xl flex items-center justify-between px-3 h-11 text-sm font-bold shadow-md`}>
                  <button
                    onClick={() => onRemoveFromCart(product)}
                    className="hover:bg-white/20 p-1 rounded cursor-pointer"
                    title="Decrease"
                  >
                    <strong className="text-base font-black leading-none">-</strong>
                  </button>
                  <span className="select-none font-black text-xs">
                    {quantityInCart} inside basket {product.stock <= 0 ? "(Pre-order)" : ""}
                  </span>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="hover:bg-white/20 p-1 rounded cursor-pointer"
                    title="Increase"
                  >
                    <strong className="text-base font-black leading-none">+</strong>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onAddToCart(product);
                  }}
                  className={`flex-1 ${product.stock <= 0 ? "bg-amber-600 hover:bg-amber-700 shadow-amber-100/40" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100/40"} text-white rounded-2xl font-black text-xs h-11 flex items-center justify-center gap-2 shadow-md transition-colors select-none cursor-pointer`}
                >
                  <ShoppingBag className="w-4.5 h-4.5 stroke-[2.25]" />
                  <span>{product.stock <= 0 ? "PRE-ORDER RESERVATION" : "ADD TO MY BASKET"}</span>
                </button>
              )}

              {/* Direct order of singular item in WhatsApp */}
              <button
                onClick={() => onOrderWhatsApp(product)}
                className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 rounded-2xl px-3 h-11 flex items-center justify-center shrink-0 transition-colors cursor-pointer text-xs font-bold gap-1.5"
                title="Singly order on WhatsApp"
              >
                <MessageSquare className="w-4.5 h-4.5 fill-emerald-800/10" />
                <span className="hidden sm:inline">Order Now</span>
              </button>
            </div>
            
            {/* Caution cold storage warning prompt */}
            {isDairy && (
              <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-3.5 italic text-center">
                ❄️ Crucial Reminder: Keep refrigerated at 4°C immediately after receiving to ensure absolute raw freshness standards fit daily health.
              </p>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
