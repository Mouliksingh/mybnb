// controllers/listings.js
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
        { title: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
        { location: { $regex: q.trim(), $options: "i" } }
      ];
    } else if (category && category.trim() !== "") {
      filter.category = category.trim();
    }

    const allListings = await Listing.find(filter).lean();
    return res.json(allListings);
  } catch (err) {
    console.error("Error fetching listings JSON:", err);
    return res.status(500).json({ error: "Unable to retrieve listings." });
  }
};

module.exports.showListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner")
      .lean();

    if (!listing) {
      return res.status(404).json({ error: "Listing does not exist." });
    }
    return res.json(listing);
  } catch (err) {
    console.error("Error fetching listing details:", err);
    return res.status(500).json({ error: "Listing lookup failed." });
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

    if (newListing.location && geocodingClient) {
      try {
        let response = await geocodingClient
          .forwardGeocode({
            query: newListing.location,
            limit: 1,
            mode: 'mapbox.places',
            countries: ['in'],
            autocomplete: false
          })
          .send();
        if (response && response.body && response.body.features.length > 0) {
          newListing.geometry = response.body.features[0].geometry;
        }
      } catch (geoErr) {
        console.error("Geocoding non-fatal error:", geoErr.message);
      }
    }

    await newListing.save();
    return res.status(201).json({ message: "Listing created successfully", listing: newListing });
  } catch (err) {
    console.error("Listing creation error:", err);
    return res.status(400).json({ error: "Failed to create listing." });
  }
};

module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

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

    return res.json({ message: "Listing updated successfully", listing });
  } catch (err) {
    console.error("Listing update error:", err);
    return res.status(400).json({ error: "Failed to update listing." });
  }
};

module.exports.destroyListing = async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    return res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error("Listing deletion error:", err);
    return res.status(500).json({ error: "Failed to delete listing." });
  }
};