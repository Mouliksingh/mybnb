// controllers/reviews.js
const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    return res.status(201).json({ message: "Review created successfully", review: newReview });
  } catch (err) {
    console.error("Review creation error:", err);
    return res.status(400).json({ error: "Failed to create review." });
  }
};

module.exports.destroyReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    return res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Review deletion error:", err);
    return res.status(500).json({ error: "Failed to delete review." });
  }
};