const Listing = require("../models/listing");
const ReviewChunk = require("../models/reviewChunk");
const ConciergeLog = require("../models/conciergeLog");
const { getEmbedding } = require("../utils/embedding");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateWithRetry(model, prompt, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      const is503 = err?.status === 503 || err?.message?.includes("Service Unavailable");
      if (!is503 || attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 500 * (2 ** attempt)));
    }
  }
}

// 1. LISTING-SPECIFIC CONCIERGE
module.exports.askConcierge = async (req, res) => {
  try {
    const { id: listingId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    const listing = await Listing.findById(listingId).populate("owner").populate({
      path: "reviews",
      populate: { path: "author" }
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    const questionEmbedding = await getEmbedding(message);
    
    let retrievedSnippets = [];
    if (questionEmbedding) {
      try {
        const chunks = await ReviewChunk.aggregate([
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: questionEmbedding,
              numCandidates: 20,
              limit: 3,
              filter: { listingId: listing._id }
            }
          }
        ]);
        retrievedSnippets = chunks.map(c => c.content);
      } catch (vectorErr) {
        console.error("Vector search fallback:", vectorErr.message);
      }
    }

    const ownerName = listing.owner ? listing.owner.username : "superhost";
    const reviewsSummary = listing.reviews && listing.reviews.length > 0 
      ? listing.reviews.map(r => `@${r.author ? r.author.username : 'Guest'} rated it ${r.rating} stars: "${r.comment}"`).join("\n") 
      : "No reviews yet.";

    const contextText = `
Listing Title: ${listing.title}
Hosted By / Owner: @${ownerName}
Location: ${listing.location}, ${listing.country}
Price: ₹${listing.price} per night
Category Type: ${listing.category || "General"}
Description: ${listing.description}
All Reviews & Ratings:
${reviewsSummary}
    `.trim();

    const prompt = `You are an expert AI concierge for this specific vacation rental on MyBnB.
Answer the guest's question accurately, politely, and directly using the provided listing details and review snippets below. 

Context:
${contextText}

Guest Question: ${message}
Answer:`;

    let result;
    try {
      const primaryModel = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      result = await generateWithRetry(primaryModel, prompt);
    } catch (err) {
      console.warn("Primary model failed after retries, falling back:", err.message);
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
      result = await generateWithRetry(fallbackModel, prompt);
    }

    const responseText = result.response.text();

    const logEntry = new ConciergeLog({
      listingId: listing._id,
      userQuery: message,
      aiResponse: responseText
    });
    await logEntry.save();

    res.json({ reply: responseText });
  } catch (err) {
    console.error("Concierge Error details:", err);
    const is503 = err?.status === 503 || err?.message?.includes("Service Unavailable");
    
    if (is503) {
      res.status(503).json({ 
        error: "The AI is temporarily overloaded due to high traffic. Please try asking again in a moment!" 
      });
    } else {
      res.status(500).json({ 
        error: "An unexpected error occurred connecting to my knowledge base. Please try again later." 
      });
    }
  }
};

// 2. GLOBAL AI RECOMMENDER (HOMEPAGE - HYBRID SEARCH)
module.exports.askGlobal = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message empty." });
    }

    const queryEmbedding = await getEmbedding(message);
    let listingsFound = [];

    // Vector Search
    if (queryEmbedding) {
      try {
        const vectorResults = await Listing.aggregate([
          {
            $vectorSearch: {
              index: "listing_vector_index",
              path: "embedding",
              queryVector: queryEmbedding,
              numCandidates: 50,
              limit: 5
            }
          }
        ]);
        listingsFound = [...vectorResults];
      } catch (vectorErr) {
         console.error("Global Vector search fallback:", vectorErr.message);
      }
    }

    // Hybrid Keyword Fallback: Cattains locations, titles, or states mentioned in prompt
    const keywords = message.split(" ").filter(w => w && w.length > 2);
    if (keywords.length > 0) {
      try {
        const regexQueries = keywords.map(kw => ({
          $or: [
            { title: { $regex: kw, $options: "i" } },
            { location: { $regex: kw, $options: "i" } },
            { country: { $regex: kw, $options: "i" } },
            { description: { $regex: kw, $options: "i" } }
          ]
        }));
        
        const keywordResults = await Listing.find({ $or: regexQueries }).limit(5);
        
        const existingIds = new Set(listingsFound.map(l => l._id.toString()));
        for (const kl of keywordResults) {
          if (!existingIds.has(kl._id.toString())) {
            listingsFound.push(kl);
            existingIds.add(kl._id.toString());
          }
        }
      } catch (regexErr) {
        console.error("Keyword search fallback error:", regexErr.message);
      }
    }

    const topListings = listingsFound.slice(0, 5).map(l => 
      `Title: ${l.title} | Location: ${l.location}, ${l.country} | Price: ₹${l.price}/night | Description: ${l.description}`
    );

    const prompt = `You are a helpful MyBnB global booking assistant. Recommend properties based strictly on the user's request and the available matching listings below. 
    
    Available matching listings:
    ${topListings.length > 0 ? topListings.join("\n\n") : "No matching listings found for this query."}
    
    User Question: ${message}
    Answer:`;

    let result;
    try {
      const primaryModel = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      result = await generateWithRetry(primaryModel, prompt);
    } catch (err) {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
      result = await generateWithRetry(fallbackModel, prompt);
    }
    
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error("Global Concierge Error details:", err);
    res.status(500).json({ error: "Global recommender is currently unavailable. Please try again later." });
  }
};