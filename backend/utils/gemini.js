// Thin wrapper around Google's Gemini API (Generative Language API).
// Docs: https://ai.google.dev/gemini-api/docs
//
// If GEMINI_API_KEY is not set (or the call fails), callers are expected to
// catch the thrown error and fall back to their non-AI logic — the app must
// keep working even without a key, per the original SRS error-handling
// requirement ("fallback response if query not understood").
//
// Uses Node's built-in fetch (Node 18+), so no extra dependency is needed.

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * @param {Object} opts
 * @param {string} [opts.systemInstruction] - high-level behaviour instructions
 * @param {string} opts.prompt - the actual user-facing prompt/context
 * @param {boolean} [opts.jsonMode] - ask Gemini to return raw JSON (for recommendations)
 * @returns {Promise<string>} the generated text
 */
const callGemini = async ({ systemInstruction, prompt, jsonMode = false }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    ...(systemInstruction && {
      systemInstruction: { parts: [{ text: systemInstruction }] },
    }),
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 512,
      ...(jsonMode && { responseMimeType: "application/json" }),
    },
  };

  const res = await fetch(`${BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini API returned no usable content");
  return text;
};

module.exports = { callGemini };
