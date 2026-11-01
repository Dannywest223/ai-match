import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";

type Msg = { id: number; from: "arrows" | "user"; text: string };

const SUGGESTIONS = [
  "What universities do you have?",
  "How do I apply?",
  "Is Arrows free?",
  "What documents do I need?",
];

export function ArrowsChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, from: "arrows", text: "Hi, I'm Arrows 👋 I can help you with universities, applications, documents, and visas. What do you need?" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  // Listen for the "Talk to Arrows" button on the dashboard
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-arrows-chat", handleOpen);
    return () => window.removeEventListener("open-arrows-chat", handleOpen);
  }, []);

  async function send(text: string) {
    const t = text.trim();
    if (!t) return;
    
    const userMsg: Msg = { id: Date.now(), from: "user", text: t };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message: t },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setMessages((m) => [...m, { id: Date.now() + 1, from: "arrows", text: data.reply }]);
    } catch (err: any) {
      setMessages((m) => [...m, { id: Date.now() + 1, from: "arrows", text: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center"
        aria-label="Chat with Arrows"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-blue-600 text-white">
            <Sparkles size={18} />
            <div className="flex-1">
              <p className="font-semibold text-sm leading-tight">Arrows</p>
              <p className="text-[11px] opacity-80">Your AI study-abroad guide</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    m.from === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 text-sm text-gray-500 animate-pulse">
                  Arrows is typing...
                </div>
              </div>
            )}
            
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-800 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Arrows anything..."
              className="flex-1 rounded-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}