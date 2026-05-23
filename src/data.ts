import { Product, Category, PromoBanner, Coupon } from "./types";

export const CATEGORIES: Category[] = [
  { id: "all", name: "All Items", icon: "Grid", slug: "all" },
  { id: "milk", name: "Fresh Milk", icon: "Milk", slug: "milk", itemCountValue: 8 },
  { id: "paneer", name: "Paneer & Curd", icon: "Cheese", slug: "paneer", itemCountValue: 6 },
  { id: "butter", name: "Butter & Creams", icon: "SquareDot", slug: "butter", itemCountValue: 4 },
  { id: "bread", name: "Bread & Bakery", icon: "Croissant", slug: "bread", itemCountValue: 5 },
  { id: "grocery", name: "Pantry Staples", icon: "ShoppingBag", slug: "grocery", itemCountValue: 12 },
];

export const PROMO_BANNERS: PromoBanner[] = [
  {
    id: "b1",
    title: "Organic Farm Rich A2 Milk",
    subtitle: "Drawn freshly at 4 AM, delivered straight to your doorstep before 7 AM.",
    discountBadge: "FREE DELIVERY",
    tag: "MORNING EXCLUSIVE",
    image: "https://images.unsplash.com/photo-1550583760-1866b27d4c21?auto=format&fit=crop&q=80&w=600",
    gradient: "from-emerald-600 to-teal-800"
  },
  {
    id: "b2",
    title: "Traditional Bilona Cow Ghee",
    subtitle: "Hand-churned from organic curd using slow firewood heating.",
    discountBadge: "15% FLAT OFF",
    tag: "PURE & HANDMADE",
    image: "https://images.unsplash.com/photo-1589733901241-5e53429e1db4?auto=format&fit=crop&q=80&w=600",
    gradient: "from-amber-600 to-orange-700"
  },
  {
    id: "b3",
    title: "Fresh Hand-pressed Paneer",
    subtitle: "Incredibly soft, vacuum-packed, containing zero added starches.",
    discountBadge: "SAVE ₹30",
    tag: "ALWAYS FRESH",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600",
    gradient: "from-teal-600 to-emerald-700"
  }
];

export const COUPONS: Coupon[] = [
  {
    code: "SMARTSHOP100",
    title: "Flat ₹100 Off",
    description: "Save ₹100 on orders above ₹800",
    discount: 100,
    minSpend: 800
  },
  {
    code: "FRESHDAIRY",
    title: "₹50 Dairy Discount",
    description: "Get ₹50 off on orders above ₹400",
    discount: 50,
    minSpend: 400
  },
  {
    code: "FREENEW",
    title: "10% Welcome Saver",
    description: "Enjoy 10% discount up to ₹150 for new members",
    discount: 75,
    minSpend: 350
  }
];

export const PRODUCTS: Product[] = [
  // MILK CATEGORY
  {
    id: "m1",
    name: "Anandwan Cow Milk (A2 Fresh)",
    category: "milk",
    price: 36,
    originalPrice: 40,
    unit: "500 ml",
    stock: 25,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400",
    description: "Premium unprocessed A2 cow milk sourced from grass-fed Gir Cows. Rich, thick, healthy, and pasteurized under absolute hygienic standards.",
    rating: 4.9,
    badge: "Fresh",
    isVeg: true
  },
  {
    id: "m2",
    name: "Anandwan Farm-Fresh Buffalo Milk",
    category: "milk",
    price: 49,
    originalPrice: 52,
    unit: "500 ml",
    stock: 12,
    image: "https://images.unsplash.com/photo-1550583760-1866b27d4c21?auto=format&fit=crop&q=80&w=400",
    description: "Thick and high-fat buffalo milk, ideal for making rich home curd, tea, sweets, and paneer.",
    rating: 4.8,
    badge: "Best Seller",
    isVeg: true
  },
  {
    id: "m3",
    name: "Anandwan Homogenized Cow Milk (Glass Bottle)",
    category: "milk",
    price: 76,
    originalPrice: 85,
    unit: "1 Litre",
    stock: 8,
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=400",
    description: "Creamy, homogenized organic farm milk packed inside a eco-friendly sterilized glass bottle.",
    rating: 4.9,
    badge: "Organic",
    isVeg: true
  },
  {
    id: "m4",
    name: "Anandwan Double Tonned Slim Milk",
    category: "milk",
    price: 29,
    originalPrice: 32,
    unit: "500 ml",
    stock: 3,
    image: "https://images.unsplash.com/photo-1528750994873-19957f6cf831?auto=format&fit=crop&q=80&w=400",
    description: "Low-fat, high-calcium diet milk perfect for weight watchers, fitness lovers, and cardiac health.",
    rating: 4.6,
    badge: "Low Stock",
    isVeg: true
  },

  // PANEER & CURD CATEGORY
  {
    id: "p1",
    name: "Anandwan Fresh Soft Paneer (Cottage Cheese)",
    category: "paneer",
    price: 85,
    originalPrice: 95,
    unit: "200 g",
    stock: 18,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400",
    description: "Super soft paneer freshly prepared by curdling pure hot cow milk. High protein with zero synthetic additives.",
    rating: 4.9,
    badge: "Best Seller",
    isVeg: true
  },
  {
    id: "p2",
    name: "Anandwan Thick Claypot-Style Dahi (Curd)",
    category: "paneer",
    price: 45,
    originalPrice: 50,
    unit: "400 g",
    stock: 20,
    image: "https://images.unsplash.com/photo-1571244856341-4f3dd9543eb7?auto=format&fit=crop&q=80&w=400",
    description: "Creamy, naturally sweet curd naturally set in a highly sterile environment. Outstanding gut fitness booster.",
    rating: 4.8,
    badge: "Fresh",
    isVeg: true
  },
  {
    id: "p3",
    name: "Anandwan Spiced Masala Paneer Cubes",
    category: "paneer",
    price: 99,
    originalPrice: 110,
    unit: "200 g",
    stock: 6,
    image: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&q=80&w=400",
    description: "Diced premium paneer infused with roasted cumin, spicy green chillies, ginger, and fresh green coriander leaves.",
    rating: 4.7,
    badge: "Organic",
    isVeg: true
  },
  {
    id: "p4",
    name: "Authentic Greek Yogurt (Blueberry Blend)",
    category: "paneer",
    price: 65,
    originalPrice: 70,
    unit: "120 g",
    stock: 15,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=400",
    description: "Rich, velvety Greek yogurt heavily packed with antioxidant-rich imported wild blueberries.",
    rating: 4.5,
    isVeg: true
  },

  // BUTTER & CREAM CATEGORY
  {
    id: "b1",
    name: "Anandwan Premium Handcrafted Desi Ghee",
    category: "butter",
    price: 395,
    originalPrice: 450,
    unit: "500 ml",
    stock: 16,
    image: "https://images.unsplash.com/photo-1589733901241-5e53429e1db4?auto=format&fit=crop&q=80&w=400",
    description: "Crafted from Gir Cow milk curd using the ancient Vedic Bilona method. Highly rich in nutrients, boosting brain health, immunity, and stamina.",
    rating: 4.9,
    badge: "Best Seller",
    isVeg: true
  },
  {
    id: "b2",
    name: "Anandwan Fresh Salted Table Butter",
    category: "butter",
    price: 115,
    originalPrice: 125,
    unit: "200 g",
    stock: 22,
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400",
    description: "Pure yellow milk fat butter lightly salted. Spreads smoothly over hot toasts, rotis, parathas, and pavs.",
    rating: 4.8,
    isVeg: true
  },
  {
    id: "b3",
    name: "Anandwan Raw White Butter (Makhan)",
    category: "butter",
    price: 130,
    originalPrice: 145,
    unit: "200 g",
    stock: 4,
    image: "https://images.unsplash.com/photo-1620921556328-1a9300dce76d?auto=format&fit=crop&q=80&w=400",
    description: "Unsalted, raw white butter extracted traditional style. Has a rich emotional connection with Punjabi parathas.",
    rating: 4.9,
    badge: "Low Stock",
    isVeg: true
  },
  {
    id: "b4",
    name: "Anandwan Gourmet Heavy Whipping Cream",
    category: "butter",
    price: 90,
    originalPrice: 100,
    unit: "250 ml",
    stock: 10,
    image: "https://images.unsplash.com/photo-1528750994873-19957f6cf831?auto=format&fit=crop&q=80&w=400",
    description: "Fresh, dense whipping cream derived from rich high-fat dairy. Perfect for baking cakes, dressing fruit salad, or building gravy.",
    rating: 4.7,
    isVeg: true
  },

  // BREAD & BAKERY
  {
    id: "br1",
    name: "Artisanal Whole Wheat Brown Bread",
    category: "bread",
    price: 45,
    originalPrice: 50,
    unit: "400 g",
    stock: 12,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
    description: "Super soft, highly high fiber whole wheat loaf baked locally. 100% Maida-free healthy sandwich bread.",
    rating: 4.7,
    badge: "Fresh",
    isVeg: true
  },
  {
    id: "br2",
    name: "Anandwan Sweet Milk Sandwich Bread",
    category: "bread",
    price: 36,
    originalPrice: 40,
    unit: "400 g",
    stock: 24,
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=400",
    description: "Traditional sweet-styled bread infused with fresh cream dairy and light sugars. Extremely soft sliced texture.",
    rating: 4.6,
    isVeg: true
  },
  {
    id: "br3",
    name: "Golden Crust Butter Croissants (2 Pcs)",
    category: "bread",
    price: 89,
    originalPrice: 110,
    unit: "150 g",
    stock: 5,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400",
    description: "Rich, layered premium butter flaky pastry baked golden. Oven warm feel that melts into morning coffees.",
    rating: 4.8,
    badge: "Best Seller",
    isVeg: true
  },
  {
    id: "br4",
    name: "Sourdough Boule (Artisanal Wild Yeast)",
    category: "bread",
    price: 120,
    originalPrice: 140,
    unit: "500 g",
    stock: 3,
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=400",
    description: "Naturally fermented sourdough bread boasting classic crispy hard crust and chewy aerated interiors.",
    rating: 4.9,
    badge: "Low Stock",
    isVeg: true
  },

  // PANTRY & GROCERY
  {
    id: "g1",
    name: "Aged Basmati Rice (Premium Extra Long)",
    category: "grocery",
    price: 135,
    originalPrice: 160,
    unit: "1 kg",
    stock: 45,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400",
    description: "Fluffy, non-sticky and heavily aromatic handpicked basmati grains. Aged up to 2 years for authentic rich biryani experience.",
    rating: 4.9,
    badge: "Best Seller",
    isVeg: true
  },
  {
    id: "g2",
    name: "Unprocessed Pure Forest Honey",
    category: "grocery",
    price: 175,
    originalPrice: 210,
    unit: "250 g",
    stock: 14,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400",
    description: "Golden liquid honey drawn from deep forest wood beecombs. Never heated, pasteurized, or sugar syrup blend watered.",
    rating: 4.8,
    badge: "Organic",
    isVeg: true
  },
  {
    id: "g3",
    name: "Cold-Pressed Wood Ghani Mustard Oil",
    category: "grocery",
    price: 185,
    originalPrice: 210,
    unit: "1 Litre",
    stock: 32,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400",
    description: "100% pure mustard oil extracted using cool slow kolhu wooden pistons. Preserves premium pungency, natural fats, and healthy smell.",
    rating: 4.7,
    isVeg: true
  },
  {
    id: "g4",
    name: "Unpolished Organic Moong Dal Chilka",
    category: "grocery",
    price: 125,
    originalPrice: 140,
    unit: "1 kg",
    stock: 25,
    image: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&q=80&w=400",
    description: "Light, healthy, high fiber split yellow-green moong dal dal unpolished with natural water treatment. Direct from source.",
    rating: 4.6,
    isVeg: true
  },
  {
    id: "g5",
    name: "Organic Whole Green Cardamom (Elaichi)",
    category: "grocery",
    price: 199,
    originalPrice: 240,
    unit: "100 g",
    stock: 9,
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=400",
    description: "Bold green cardamom pods filled with intensely aromatic sweet essential oils. Sun-dried carefully without synthetic colors.",
    rating: 4.9,
    badge: "Organic",
    isVeg: true
  }
];

// Simple, fun real customer reviews for premium feel
export const STORE_REVIEWS = [
  {
    id: "r1",
    name: "Meera Deshmukh",
    rating: 5,
    comment: "The A2 Cow milk arrives by 6:00 AM in sterile glass bottles. Absolute cream layer! My kids love it.",
    date: "2 days ago",
  },
  {
    id: "r2",
    name: "Rohan Kulkarni",
    rating: 5,
    comment: "Anandwan's Bilona ghee is genuinely pure. It has that coarse, granular texture you only get from hand-churning.",
    date: "1 week ago",
  },
  {
    id: "r3",
    name: "Sneha Nair",
    rating: 5,
    comment: "Super fast deliveries. The soft paneer makes restaurant-level paneer butter masala. Blinkit speed but local quality!",
    date: "Yesterday",
  }
];
