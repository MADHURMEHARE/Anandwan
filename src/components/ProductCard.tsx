import React from "react";
import { MessageSquare, Plus, Minus, ShoppingCart, Star } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (p: Product) => void;
  onOrderWhatsApp: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
  onOrderWhatsApp,
}) => {
  const isOutOfStock = product.stock <= 0;

  // Custom Color styling for product badges
  const getBadgeStyle = (badge: Product["badge"]) => {
    switch (badge) {
      case "Fresh":
        return "bg-emerald-100/90 text-emerald-900 border-emerald-200/50";
      case "Best Seller":
        return "bg-amber-100/90 text-amber-950 border-amber-200/50";
      case "Organic":
        return "bg-teal-100/90 text-teal-900 border-teal-200/50";
      case "Low Stock":
        return "bg-rose-100/90 text-rose-900 border-rose-200/50 animate-pulse font-black";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200/50";
    }
  };

  // Savings calculation
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-xs hover:shadow-xl hover:border-emerald-100/80 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden h-[360px] sm:h-[390px]"
    >
      
      {/* Top Indicators Row */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        
        {/* Category Badge Tag */}
        {product.badge ? (
          <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getBadgeStyle(product.badge)}`}>
            {product.badge}
          </span>
        ) : (
          <div></div>
        )}

        {/* Veg Indian Stamp Indicator */}
        {product.isVeg && (
          <div className="bg-white/95 p-1 rounded-md border border-gray-150 flex items-center justify-center shrink-0 shadow-sm" title="100% Vegetarian Product">
            <div className="w-2.5 h-2.5 border-2 border-green-600 p-0.5 rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-green-600 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Product Image Panel */}
      <div className="relative w-full h-[150px] sm:h-[170px] bg-gray-50 rounded-xl overflow-hidden mt-2 shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Shimmer loading gradient backdrop overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

        {/* Star Rating small pill */}
        {product.rating && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-[10px] text-white font-extrabold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{product.rating}</span>
          </div>
        )}
      </div>

      {/* Texts Content */}
      <div className="flex-1 mt-3 flex flex-col justify-between">
        {/* Brand header + title */}
        <div>
          <span className="block text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider leading-none">
            Anandwan Dairy
          </span>
          <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 tracking-tight leading-snug mt-1 group-hover:text-emerald-950 transition-colors line-clamp-2">
            {product.name}
          </h4>
          <span className="block text-[10.5px] font-semibold text-gray-400 mt-0.5">
            Quantity: {product.unit}
          </span>
        </div>

        {/* Dynamic Pricing information */}
        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-gray-950">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through font-medium">
                ₹{product.originalPrice}
              </span>
            )}
            
            {savings > 0 && (
              <span className="text-[9.5px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-md py-0.5 px-1.5 text-center leading-none">
                Save ₹{savings}
              </span>
            )}
          </div>

          <p className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-1 leading-normal mt-1 italic">
            {product.description}
          </p>
        </div>
      </div>

      {/* Cart Control + Social WhatsApp Order Triggers */}
      <div className="mt-4 pt-3 border-t border-gray-50 space-y-2 shrink-0">
        
        <div className="flex items-center gap-2">
          {/* Out of Stock visual label vs Quantity Controls */}
          {isOutOfStock ? (
            quantityInCart > 0 ? (
              <div className="flex-1 bg-amber-600 text-white flex items-center justify-between rounded-xl px-2 shadow-sm font-bold text-xs h-9">
                <button
                  onClick={() => onRemoveFromCart(product)}
                  className="hover:bg-white/20 active:scale-95 text-white p-1 rounded-lg transition-colors cursor-pointer"
                  title="Decrease Pre-order allocation"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <span className="font-black text-xs select-none">
                  {quantityInCart} Pre-order
                </span>
                <button
                  onClick={() => onAddToCart(product)}
                  className="hover:bg-white/20 active:scale-95 text-white p-1 rounded-lg transition-colors cursor-pointer"
                  title="Increase Pre-order allocation"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                className="flex-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-extrabold text-[11px] py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer h-9 shrink-0 select-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>PRE-ORDER</span>
              </button>
            )
          ) : quantityInCart > 0 ? (
            <div className="flex-1 bg-emerald-600 text-white flex items-center justify-between rounded-xl px-2 shadow-sm font-bold text-xs h-9">
              <button
                onClick={() => onRemoveFromCart(product)}
                className="hover:bg-white/20 active:scale-95 text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="font-black text-xs select-none">
                {quantityInCart}
              </span>
              <button
                onClick={() => onAddToCart(product)}
                className="hover:bg-white/20 active:scale-95 text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 hover:text-emerald-800 font-black text-xs py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer h-9 shrink-0 select-none"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ADD</span>
            </button>
          )}

          {/* Rapid WhatsApp Click Direct Ordering button */}
          <button
            onClick={() => onOrderWhatsApp(product)}
            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 p-2 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer h-9 w-9"
            title="Order this item singly on WhatsApp"
          >
            <MessageSquare className="w-4 h-4 fill-emerald-800/20" />
          </button>
        </div>

      </div>
    </div>
  );
};
