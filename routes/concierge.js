const express = require("express");
const router = express.Router();
const conciergeController = require("../controllers/concierge.js");
const wrapAsync = require("../utils/wrapAsync.js");

// Global AI Recommender (Homepage)
router.post("/ask-global", wrapAsync(conciergeController.askGlobal));

// Listing-specific AI Concierge (Show Page)
router.post("/listings/:id/ask", wrapAsync(conciergeController.askConcierge));

module.exports = router;