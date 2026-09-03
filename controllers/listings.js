const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;

module.exports.index = async (req, res) => {
  try {
    const { q, category } = req.query;
    let filter = {};

    if (q && q.trim() !== "") {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } }
      ];
    } else if (category && category.trim() !== "") {
      filter.category = category.trim();
    }

    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", {
      allListings,
      searchQuery: q || "",
      selectedCategory: category || ""
    });
  } catch (err) {
    console.error("Error in index route:", err);
    req.flash("error", "Unable to load listings.");
    res.redirect("/listings");
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    console.error("Error in showListing:", err);
    req.flash("error", "Listing not found.");
    res.redirect("/listings");
  }
};

module.exports.createListing = async (req, res) => {
  try {
    let imagesArray = [];
    if (req.files && req.files.length > 0) {
      imagesArray = req.files.map(f => ({ url: f.path, filename: f.filename }));
    } else if (req.file) {
      imagesArray.push({ url: req.file.path, filename: req.file.filename });
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = imagesArray.length > 0 ? imagesArray[0] : { url: "", filename: "" };
    newListing.images = imagesArray;

    if (req.body.listing && req.body.listing.location && geocodingClient) {
      try {
        let response = await geocodingClient
          .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
          })
          .send();
        if (response && response.body && response.body.features.length > 0) {
          newListing.geometry = response.body.features[0].geometry;
        }
      } catch (geoErr) {
        console.error("Geocoding failed (non-fatal):", geoErr.message);
      }
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    console.error("CRITICAL CREATE LISTING ERROR:", err);
    req.flash("error", "Failed to create listing. Please check all fields.");
    res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    let originalImageUrl = listing.image && listing.image.url ? listing.image.url : "";
    if (originalImageUrl) {
      originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    }
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  } catch (err) {
    console.error("Error in renderEditForm:", err);
    res.redirect("/listings");
  }
};

module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    let imagesArray = [];
    if (req.files && req.files.length > 0) {
      imagesArray = req.files.map(f => ({ url: f.path, filename: f.filename }));
    } else if (req.file) {
      imagesArray.push({ url: req.file.path, filename: req.file.filename });
    }

    if (imagesArray.length > 0) {
      listing.images = imagesArray;
      listing.image = imagesArray[0];
      await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("Error updating listing:", err);
    req.flash("error", "Failed to update listing.");
    res.redirect(`/listings/${req.params.id}/edit`);
  }
};

module.exports.destroyListing = async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  } catch (err) {
    console.error("Error deleting listing:", err);
    res.redirect("/listings");
  }
};