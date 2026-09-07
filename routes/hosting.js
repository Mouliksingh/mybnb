// routes/hosting.js
const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).lean();
    return res.json(listings);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch hosted properties." });
  }
});

module.exports = router;