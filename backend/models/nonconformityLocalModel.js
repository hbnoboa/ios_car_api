const mongoose = require("mongoose");

const nonconformityLocalSchema = new mongoose.Schema(
  {
    local: String,
  },
  { timestamps: true, collection: "nonconformity_locals" }
);

module.exports = mongoose.model("NonconformityLocal", nonconformityLocalSchema);
