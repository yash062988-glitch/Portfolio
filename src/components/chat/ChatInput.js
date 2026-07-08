import { Send } from "lucide-react";

export default function ChatInput({ inputVal, setInputVal, onSend, disabled }) {
  return (
    <form onSubmit={onSend} className="p-4 border-t border-white/10 flex items-center gap-2 bg-white/[0.01]">
      <input
        type="text"
        placeholder="Ask something about Yash..."
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        disabled={disabled}
        className="flex-grow px-5 py-3 rounded-xl border border-white/10 bg-[#0b0705]/80 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-all duration-300 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!inputVal.trim() || disabled}
        className="p-3 rounded-xl bg-primary text-[#120c08] hover:bg-secondary transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
        aria-label="Send query"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
