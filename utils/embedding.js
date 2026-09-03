const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getEmbedding(text) {
  if (!text || text.trim() === "") return null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error("Error generating Gemini embedding:", err.message);
    return null; 
  }
}

module.exports = { getEmbedding };