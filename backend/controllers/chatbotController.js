const Order = require("../models/Order");
const Product = require("../models/Product");
const { callGemini } = require("../utils/gemini");

/**
 * SRS 3.2.8 AI Chatbot / 3.3.14 AI Chatbot Support
 * Inputs: user queries
 * Processing: AI chatbot processes user questions
 * Outputs: relevant responses
 * Error Handling: fallback response if query not understood
 *
 * Implemented as a rule-based intent matcher (keyword rules) so it works with
 * zero external dependencies/cost. The structure is intentionally modular:
 * each "intent" is a matcher + handler, so a real LLM/NLU call can later
 * replace `detectIntent` without changing the route or response contract.
 */
const FALLBACK_RESPONSE =
  "Sorry, I didn't quite understand that. You can ask me about your order status, product search, returns, or how to contact support.";

const INTENTS = [
  {
    name: "greeting",
    match: /\b(hi|hello|hey|salam|assalam)\b/i,
    handler: async () => "Hello! I'm your shopping assistant. Ask me about orders, products, or returns.",
  },
  {
    name: "track_order",
    match: /\b(track|tracking|where is my order|order status)\b/i,
    handler: async (req, entities) => {
      if (!req.user) return "Please log in first so I can look up your orders.";
      if (entities.trackingId) {
        const order = await Order.findOne({ trackingId: entities.trackingId });
        if (!order) return `I couldn't find an order with tracking ID ${entities.trackingId}.`;
        return `Order ${order.trackingId} is currently "${order.status}".`;
      }
      const latest = await Order.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (!latest) return "You don't have any orders yet.";
      return `Your most recent order (${latest.trackingId}) is currently "${latest.status}".`;
    },
  },
  {
    name: "search_product",
    match: /\b(find|search|looking for|do you have)\b/i,
    handler: async (req, entities, rawMessage) => {
      const keyword = rawMessage
        .replace(/\b(find|search|looking for|do you have|for|a|an|the)\b/gi, "")
        .trim();
      if (!keyword) return "What product are you looking for?";
      const products = await Product.find({ $text: { $search: keyword } }).limit(3);
      if (products.length === 0) return `I couldn't find any products matching "${keyword}".`;
      const names = products.map((p) => `${p.name} (Rs. ${p.price})`).join(", ");
      return `Here's what I found: ${names}.`;
    },
  },
  {
    name: "return_policy",
    match: /\b(return|refund|exchange)\b/i,
    handler: async () =>
      "You can request a return within 7 days of delivery from your order history page. Refunds are processed within 3-5 business days.",
  },
  {
    name: "contact_support",
    match: /\b(human|agent|support|help me|complaint)\b/i,
    handler: async () =>
      "I can connect you with our support team. Please describe your issue and a representative will follow up by email.",
  },
];

const extractTrackingId = (message) => {
  const found = message.match(/TRK-[A-Z0-9-]+/i);
  return found ? found[0].toUpperCase() : null;
};

// @desc  Chatbot query endpoint (UC-14 AI Chatbot Support)
// @route POST /api/chatbot
// @access Public (works better when logged in, for order lookups)
const chatWithBot = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const entities = { trackingId: extractTrackingId(message) };

    // Build real, DB-backed context so Gemini answers with facts instead of
    // inventing order statuses / prices (grounding, not just a raw prompt).
    const contextLines = [];
    try {
      if (req.user) {
        const latestOrder = await Order.findOne({ user: req.user._id }).sort({ createdAt: -1 });
        if (latestOrder) {
          contextLines.push(
            `Customer's most recent order: ${latestOrder.trackingId}, status "${latestOrder.status}", total Rs. ${latestOrder.totalPrice}.`
          );
        }
      }
      if (entities.trackingId) {
        const order = await Order.findOne({ trackingId: entities.trackingId });
        contextLines.push(
          order
            ? `Order ${entities.trackingId} status: "${order.status}".`
            : `No order found with tracking ID ${entities.trackingId}.`
        );
      }
      const searchMatches = await Product.find({ $text: { $search: message } }).limit(3);
      if (searchMatches.length) {
        contextLines.push(
          `Possibly relevant products in catalog: ${searchMatches
            .map((p) => `${p.name} (Rs. ${p.price}, ${p.category}, stock ${p.stock})`)
            .join("; ")}.`
        );
      }
    } catch (contextErr) {
      // Context gathering is best-effort; a failure here shouldn't block the reply.
    }

    let reply;
    let source;

    try {
      reply = await callGemini({
        systemInstruction:
          "You are Trove's shopping assistant chatbot for an e-commerce marketplace. " +
          "Reply in 1-3 short sentences, friendly and to the point. " +
          "Only state order status, prices, or stock numbers if they appear in the CONTEXT below — " +
          "never invent tracking IDs, prices, or availability. " +
          "If the context doesn't cover the question, say you don't have that information and suggest " +
          "contacting support or browsing the site.",
        prompt: `Context:\n${contextLines.join("\n") || "No specific order/product context available."}\n\nCustomer message: "${message}"`,
      });
      source = "gemini";
    } catch (aiErr) {
      // 3.2.8 Error Handling: fallback response if Gemini is unavailable/unconfigured
      console.error("[chatbot] Gemini call failed, using fallback:", aiErr.message);
      const intent = INTENTS.find((i) => i.match.test(message));
      try {
        reply = intent ? await intent.handler(req, entities, message) : FALLBACK_RESPONSE;
      } catch (handlerErr) {
        reply = FALLBACK_RESPONSE;
      }
      source = intent ? intent.name : "fallback";
    }

    res.json({ reply, source });
  } catch (err) {
    next(err);
  }
};

module.exports = { chatWithBot };
