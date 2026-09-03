const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.js");
const { isLoggedIn } = require("../middleware.js");

router.get("/", isLoggedIn, bookingController.index);
router.post("/:id", isLoggedIn, bookingController.createBooking);
router.delete("/:bookingId", isLoggedIn, bookingController.cancelBooking);

module.exports = router;