import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Info, ShoppingBag, X, MessageSquare } from "lucide-react";
import { ToastMessage } from "../types";

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastCardProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const getStyle = () => {
    switch (toast.type) {
      case "success":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
          icon: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
        };
      case "cart":
        return {
          bg: "bg-emerald-600 border-emerald-700 text-white shadow-emerald-200",
          icon: <ShoppingBag className="w-5 h-5 text-white shrink-0" />,
        };
      case "info":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-900",
          icon: <Info className="w-5 h-5 text-amber-500 shrink-0" />,
        };
      case "error":
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-900",
          icon: <X className="w-5 h-5 text-rose-500 shrink-0" />,
        };
      default:
        return {
          bg: "bg-slate-50 border-slate-200 text-slate-900",
          icon: <MessageSquare className="w-5 h-5 text-slate-500 shrink-0" />,
        };
    }
  };

  const { bg, icon } = getStyle();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg ${bg} w-full`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-semibold tracking-wide leading-tight">
          {toast.message}
        </span>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-60 hover:opacity-100 transition-opacity p-1 ml-4 rounded-lg hover:bg-black/5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
