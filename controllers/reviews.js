const Listing = require("../models/listing");
const Review = require("../models/review");
const ReviewChunk = require("../models/reviewChunk");
const { getEmbedding } = require("../utils/embedding");

// Helper to update listing's main rolled-up embedding
async function updateListingEmbedding(listingId) {
  try {
    const listing = await Listing.findById(listingId).populate({
      path: "reviews",
      options: { sort: { createdAt: -1 }, limit: 5 }
    });
    if (!listing) return;

    const reviewRollup = listing.reviews.map(r => r.comment).join(" ");
    const textBlob = `Title: ${listing.title}. Location: ${listing.location}, ${listing.country}. Category: ${listing.category}. Description: ${listing.description}. Recent Reviews: ${reviewRollup}`;
    
    const vector = await getEmbedding(textBlob);
    if (vector) {
      await Listing.collection.updateOne(
        { _id: listing._id },
        { $set: { embedding: vector } }
      );
    }
  } catch (err) {
    console.error("Background listing embedding update failed:", err.message);
  }
}

module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  // 1. Generate embedding and create an individual ReviewChunk for fine-grained AI concierge retrieval
  try {
    const reviewVector = await getEmbedding(newReview.comment);
    if (reviewVector) {
      const reviewChunk = new ReviewChunk({
        listingId: listing._id,
        content: newReview.comment,
        embedding: reviewVector
      });
      await reviewChunk.save();
    }
  } catch (chunkErr) {
    console.error("Failed to create review chunk embedding:", chunkErr.message);
  }

  // 2. Refresh the listing's overall rollup embedding in the background
  updateListingEmbedding(listing._id);

  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete this review!");
    return res.redirect(`/listings/${id}`);
  }

  // Remove the review from the listing reviews array and delete the document
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  
  // Also remove the corresponding fine-grained ReviewChunk for the concierge
  await ReviewChunk.deleteMany({ listingId: id, content: review.comment });
  
  await Review.findByIdAndDelete(reviewId);

  // Refresh listing rollup embedding
  updateListingEmbedding(id);

  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};