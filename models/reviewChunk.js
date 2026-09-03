const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewChunkSchema = new Schema({
  listingId: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  }
});

module.exports = mongoose.model("ReviewChunk", reviewChunkSchema);