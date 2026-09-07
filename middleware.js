// middleware.js
const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "You must be logged in to do that." });
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing || !listing.owner.equals(req.user._id)) {
      return res.status(403).json({ error: "You are not authorized to perform this action." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: "Authorization check failed." });
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review || !review.author.equals(req.user._id)) {
      return res.status(403).json({ error: "You are not authorized to perform this action." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: "Review authorization check failed." });
  }
};