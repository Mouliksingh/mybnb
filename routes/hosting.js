const express = require("express");
const router = express.Router();
const hostingController = require("../controllers/hosting.js");
const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");

router.get("/hosting/reservations", isLoggedIn, wrapAsync(hostingController.getHostingReservations));

module.exports = router;