const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("listing");
    res.render("bookings/index.ejs", { bookings });
  } catch (err) {
    req.flash("error", "Could not fetch your trips.");
    res.redirect("/listings");
  }
};

module.exports.createBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, totalPrice } = req.body;
    
    if (!checkIn || !checkOut) {
      req.flash("error", "Please select valid check-in and check-out dates.");
      return res.redirect(`/listings/${id}`);
    }

    const newBooking = new Booking({
      listing: id,
      user: req.user._id,
      checkIn,
      checkOut,
      totalPrice: totalPrice || 0,
    });

    await newBooking.save();
    req.flash("success", "Successfully booked this listing!");
    res.redirect("/bookings");
  } catch (err) {
    console.error("Booking creation error:", err);
    req.flash("error", "Error creating booking.");
    res.redirect(`/listings/${req.params.id}`);
  }
};

module.exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    await Booking.findByIdAndDelete(bookingId);
    req.flash("success", "Booking cancelled successfully.");
    res.redirect("/bookings");
  } catch (err) {
    req.flash("error", "Could not cancel booking.");
    res.redirect("/bookings");
  }
};