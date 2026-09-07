// controllers/concierge.js
const Listing = require("../models/listing");
const ConciergeLog = require("../models/conciergeLog");
const { GoogleGenAI } = require("@google/generative-ai");

module.exports.askConcierge = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query cannot be empty." });
    }

    let listings = await Listing.find({}).populate("owner").populate("reviews").lean();
    let contextText = listings.map(l => 
      `Title: ${l.title}, Location: ${l.location}, ${l.country}, Category: ${l.category}, Price: INR ${l.price}, Owner: ${l.owner ? l.owner.username : "Unknown"}, Description: ${l.description}`
    ).join("\n---\n");

    const apiKey = process.env.GEMINI_API_KEY;
    let responseText = "I am currently processing your request. Enjoy your stay with MyBnB!";

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an omniscient AI Concierge for MyBnB. Use this live database context to answer the user query accurately:\n\nDatabase Context:\n${contextText}\n\nUser Query: ${query}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
      });
      responseText = response.text || responseText;
    }

    if (req.user) {
      const log = new ConciergeLog({
        user: req.user._id,
        query,
        response: responseText
      });
      await log.save();
    }

    return res.json({ response: responseText });
  } catch (err) {
    console.error("RAG Concierge API Error:", err);
    return res.status(500).json({ error: "AI Concierge processing fault." });
  }
};