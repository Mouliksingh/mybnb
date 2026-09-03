require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/review");
const { getEmbedding } = require("../utils/embedding");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/MyBnB";

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to DB for embedding backfill...");

  const listings = await Listing.find({}).populate({
    path: "reviews",
    options: { sort: { createdAt: -1 }, limit: 5 }
  });

  for (let listing of listings) {
    // Build rollup blob combining title, location, description, category, and recent reviews
    const reviewRollup = listing.reviews.map(r => r.comment).join(" ");
    const textBlob = `Title: ${listing.title}. Location: ${listing.location}, ${listing.country}. Category: ${listing.category}. Description: ${listing.description}. Recent Reviews: ${reviewRollup}`;

    console.log(`Generating embedding for: ${listing.title}...`);
    const vector = await getEmbedding(textBlob);

    if (vector) {
      // Use collection update to bypass schema select: false restrictions if needed
      await Listing.collection.updateOne(
        { _id: listing._id },
        { $set: { embedding: vector } }
      );
      console.log(`✓ Embedded successfully: ${listing.title}`);
    } else {
      console.log(`✗ Failed to embed: ${listing.title}`);
    }
    
    // Brief pause to respect API rate limits on free tiers
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("Backfill complete!");
  mongoose.connection.close();
}

main().catch(err => {
  console.error("Backfill error:", err);
  mongoose.connection.close();
});