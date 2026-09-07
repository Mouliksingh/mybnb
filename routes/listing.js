// routes/listing.js
const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listings");
const { isLoggedIn, isOwner } = require("../middleware");
const multer = require('multer');
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

router.route("/")
  .get(listingController.index)
  .post(isLoggedIn, upload.array('listing[images]'), listingController.createListing);

router.route("/:id")
  .get(listingController.showListing)
  .put(isLoggedIn, isOwner, upload.array('listing[images]'), listingController.updateListing)
  .delete(isLoggedIn, isOwner, listingController.destroyListing);

module.exports = router;