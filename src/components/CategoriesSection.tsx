import React from "react";
import * as LucideIcons from "lucide-react";
import { Category } from "../types";
import { CATEGORIES } from "../data";

interface CategoriesSectionProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

// Circular list rendering for categories
export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category Section Title banner */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-black text-gray-950 tracking-tight">
            Explore Curated Categories
          </h3>
          <p className="text-[11px] text-gray-500 font-medium">
            Handpicked, hygiene-tested fresh dairy and pantry essentials
          </p>
        </div>
        <div className="flex gap-1.5 items-center bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-bold text-emerald-800">100% In Stock</span>
        </div>
      </div>

      {/* Circular Layout Grid */}
      <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto pb-4 pt-1 justify-start md:justify-center scrollbar-none snap-x">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.id;
          
          // Dynamically obtain the right Lucide icon or fall back to standard Box
          const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Package;

          return (
            <button
              id={`cat-card-${category.id}`}
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="flex flex-col items-center gap-2 group cursor-pointer text-center shrink-0 snap-center select-none focus:outline-hidden"
            >
              {/* Outer Circular frame with conditional active rings */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 transform group-active:scale-95 ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-50 scale-105"
                    : "bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 hover:scale-105 border border-gray-100"
                }`}
              >
                {/* Embedded Icon */}
                <IconComponent className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:rotate-6 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>

              {/* Text label with counts */}
              <div className="space-y-0.5">
                <span
                  className={`text-xs block tracking-tight transition-colors duration-200 ${
                    isActive ? "font-extrabold text-emerald-950" : "font-bold text-gray-600 group-hover:text-emerald-800"
                  }`}
                >
                  {category.name}
                </span>
                
                {category.itemCountValue && (
                  <span className={`text-[9px] block text-gray-400 font-semibold group-hover:text-emerald-600 transition-colors ${isActive ? "text-emerald-600/90 font-extrabold" : ""}`}>
                    {category.itemCountValue} Items
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
