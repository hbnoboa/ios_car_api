const mongoose = require("mongoose");

const nonconformityLevelSchema = new mongoose.Schema(
  {
    level: String,
  },
  { timestamps: true, collection: "nonconformity_levels" }
);

module.exports = mongoose.model("NonconformityLevel", nonconformityLevelSchema);
