const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.getHostingReservations = async (req, res) => {
  const userId = req.user._id;
  const userListings = await Listing.find({ owner: userId });
  const listingIds = userListings.map(l => l._id);

  const reservations = await Booking.find({ listing: { $in: listingIds } })
    .populate("listing user")
    .sort({ checkIn: 1 });

  res.render("hosting/reservations.ejs", { reservations, userListings });
};