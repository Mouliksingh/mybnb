// routes/review.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controllers/reviews");
const { isLoggedIn, isReviewAuthor } = require("../middleware");

router.post("/", isLoggedIn, reviewController.createReview);
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, reviewController.destroyReview);

module.exports = router;