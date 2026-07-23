const Product = require("../models/Product");
const User = require("../models/User");
const { callGemini } = require("../utils/gemini");

/**
 * SRS 3.2.7 AI Recommendation
 * Inputs: user browsing history and preferences
 * Processing: analyze behaviour to suggest products
 * Outputs: personalized recommendations
 * Error Handling: show default (popular) recommendations if no data is available
 *
 * Three-tier strategy:
 * 1. If GEMINI_API_KEY is set and the user has browsing history, ask Gemini
 *    to rank a candidate pool of products against that history (structured
 *    JSON output, validated against the real candidate IDs so it can never
 *    "invent" a product that doesn't exist).
 * 2. If Gemini is unavailable/unconfigured/fails, fall back to a lightweight
 *    content-based filter: same-category products sorted by rating.
 * 3. If there's no browsing history at all (or nothing is left), fall back
 *    to globally popular (highest rated) products.
 */
const getRecommendations = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 8;
    let recommended = [];
    let basedOn = "popularity";

    if (req.user) {
      const user = await User.findById(req.user._id).populate("browsingHistory");

      if (user.browsingHistory && user.browsingHistory.length > 0) {
        const viewedIds = user.browsingHistory.map((p) => p._id.toString());
        const candidates = await Product.find({ _id: { $nin: viewedIds } }).limit(60);

        if (candidates.length > 0) {
          try {
            const prompt =
              `Shopper's browsing history:\n${user.browsingHistory
                .map((p) => `- ${p.name} (${p.category}, Rs. ${p.price})`)
                .join("\n")}\n\n` +
              `Candidate products (JSON):\n${JSON.stringify(
                candidates.map((c) => ({
                  id: c._id.toString(),
                  name: c.name,
                  category: c.category,
                  price: c.price,
                  rating: c.ratingAverage,
                }))
              )}\n\n` +
              `Return ONLY a JSON array of up to ${limit} "id" strings from the candidates list above, ` +
              `ordered best-match first, based on the shopper's browsing history. No explanation, just the array.`;

            const raw = await callGemini({
              systemInstruction:
                "You are a product recommendation engine for an e-commerce marketplace. " +
                "Only return ids that literally exist in the candidates list — never invent one. " +
                "Output must be valid JSON and nothing else.",
              prompt,
              jsonMode: true,
            });

            const ids = JSON.parse(raw);
            const candidateIds = new Set(candidates.map((c) => c._id.toString()));
            const validIds = Array.isArray(ids) ? ids.filter((id) => candidateIds.has(id)) : [];

            recommended = validIds
              .map((id) => candidates.find((c) => c._id.toString() === id))
              .filter(Boolean)
              .slice(0, limit);

            if (recommended.length > 0) basedOn = "gemini_ai";
          } catch (aiErr) {
            // Gemini unavailable/unconfigured/invalid output — fall through to rule-based filter below
            console.error("[ai] Gemini recommendation call failed, using fallback:", aiErr.message);
          }
        }

        if (recommended.length === 0) {
          const viewedCategories = [...new Set(user.browsingHistory.map((p) => p.category))];
          recommended = await Product.find({
            category: { $in: viewedCategories },
            _id: { $nin: viewedIds },
          })
            .sort({ ratingAverage: -1, createdAt: -1 })
            .limit(limit);
          if (recommended.length > 0) basedOn = "browsing_history";
        }
      }
    }

    // Error Handling fallback: default/popular recommendations if no personalized data
    if (recommended.length === 0) {
      recommended = await Product.find({})
        .sort({ ratingAverage: -1, ratingCount: -1, createdAt: -1 })
        .limit(limit);
    }

    res.json({ basedOn, products: recommended });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };
