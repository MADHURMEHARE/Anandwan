import React, { useState } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");

  const QUICK_QUESTIONS = [
    { label: "🥛 Milk availability check", text: "Hello Anandwan Smart Shop! Is the Raw A2 Cow Milk in stock for delivery today?" },
    { label: "🛵 Delay or delivery ETA inquiry", text: "Hello helpdesk! I want to check when the morning milk delivery arrives at my location." },
    { label: "📦 Make a custom order request", text: "Hello! I want to order custom fresh groceries and paneer. Please connect me." },
  ];

  const handleSendPrompt = (textToDeliver: string) => {
    const encoded = encodeURIComponent(textToDeliver);
    window.open(`https://wa.me/919422111111?text=${encoded}`, "_blank");
    setIsOpen(false);
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    handleSendPrompt(customMsg.trim());
    setCustomMsg("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Dialog Bubble */}
      {isOpen && (
        <div className="bg-white border border-gray-100 rounded-3xl w-80 shadow-2xl p-4.5 mb-3.5 border-t-emerald-400 border-t-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs animate-pulse">
                💬
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-gray-900">Anandwan Support</h4>
                <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1">
                  <span>●</span> 100% Online Help Desk
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-950 p-1 rounded-lg hover:bg-gray-50 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10.5px] text-gray-500 font-semibold leading-relaxed mb-3">
            Welcome to Anandwan Smart Shop support. Choose a instant micro-query below or type a custom note:
          </p>

          {/* Quick choices chips */}
          <div className="space-y-1.5 mb-3.5">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(q.text)}
                className="w-full text-left bg-gray-50 hover:bg-emerald-50/80 border border-gray-150 hover:border-emerald-200 py-1.5 px-3 rounded-xl text-[10.5px] text-gray-700 hover:text-emerald-900 transition-all font-semibold block leading-tight cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Prompt Message form */}
          <form onSubmit={handleCustomSend} className="relative">
            <input
              type="text"
              placeholder="Ask anything (e.g. deliver double cream)..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:bg-white text-xs text-gray-800 placeholder-gray-400 pl-3 pr-10 py-2 rounded-xl outline-hidden focus:border-emerald-300 font-medium"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-lg transition-colors cursor-pointer"
              title="Submit custom request to WhatsApp"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

      {/* Floating launcher trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300/50 transition-all cursor-pointer group"
        title="Chat with Anandwan Smart Support"
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.25]" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 stroke-[2.25] fill-white/10 group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 w-3 h-3 rounded-full border-2 border-emerald-500 animate-ping"></span>
          </div>
        )}
      </button>

    </div>
  );
};
