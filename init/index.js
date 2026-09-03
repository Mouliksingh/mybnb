require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/MyBnB";

main()
  .then(() => {
    console.log("Connected to DB for seeding");
    initDB();
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PROD_SEED) {
    console.error("Aborting seed operation: Seeding production database is disabled for safety.");
    process.exit(1);
  }

  await Listing.deleteMany({});
  const modifiedData = initData.data.map((obj) => ({
    ...obj,
    owner: "655b38d7a1b2c3d4e5f6789a", // Replace with a valid mock User ObjectId if needed
    category: "Trending"
  }));
  await Listing.insertMany(modifiedData);
  console.log("Database was initialized");
  mongoose.connection.close();
};