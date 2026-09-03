const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conciergeLogSchema = new Schema({
  listingId: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },
  userQuery: {
    type: String,
    required: true
  },
  aiResponse: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Automatically delete concierge chat logs 24 hours (86400 seconds) after creation
conciergeLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("ConciergeLog", conciergeLogSchema);