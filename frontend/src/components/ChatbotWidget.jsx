import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import api from "../api/axios";

// UC-14 AI Chatbot Support: user opens chatbot, asks question, sees response
const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about orders, products, or returns." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await api.post("/chatbot", { message: userMessage.text });
      setMessages((prev) => [...prev, { from: "bot", text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button className="chatbot-toggle" onClick={() => setOpen(true)} title="Chat with us" aria-label="Open chat">
        <MessageCircle size={22} />
      </button>
    );
  }

  return (
    <div className="chatbot-widget">
      <div className="chatbot-widget__header">
        <span>Trove Assistant</span>
        <button onClick={() => setOpen(false)} aria-label="Close chat">
          <X size={16} />
        </button>
      </div>
      <div className="chatbot-messages">
        {messages.map((m, idx) => (
          <div key={idx} style={{ textAlign: m.from === "user" ? "right" : "left" }}>
            <span className={`chatbot-bubble ${m.from}`}>{m.text}</span>
          </div>
        ))}
        {sending && (
          <div style={{ textAlign: "left" }}>
            <span className="chatbot-bubble bot">Typing...</span>
          </div>
        )}
      </div>
      <div className="chatbot-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button className="btn" onClick={sendMessage} disabled={sending} aria-label="Send message">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default ChatbotWidget;
