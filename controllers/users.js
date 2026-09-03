const User = require("../models/user");
const Listing = require("../models/listing");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to MyBnB!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to MyBnB!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};

// Toggle Favorite (AJAX)
module.exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    
    const isFavorite = user.favorites.includes(id);
    if (isFavorite) {
      user.favorites.pull(id);
    } else {
      user.favorites.push(id);
    }
    
    await user.save();
    res.json({ success: true, isFavorite: !isFavorite });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Render Wishlist
module.exports.renderWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  res.render("users/wishlist.ejs", { listings: user.favorites });
};

// Render Host Dashboard (My Listings)
module.exports.renderMyListings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  res.render("listings/my-listings.ejs", { listings });
};

// Render Public Profile
module.exports.renderProfile = async (req, res) => {
  const { username } = req.params;
  const profileUser = await User.findOne({ username });
  
  if (!profileUser) {
    req.flash("error", "User not found.");
    return res.redirect("/listings");
  }
  
  const userListings = await Listing.find({ owner: profileUser._id });
  res.render("users/profile.ejs", { profileUser, userListings });
};