const mongoose = require("mongoose");

const nonconformityTypeSchema = new mongoose.Schema(
  {
    nctype: String,
  },
  { timestamps: true, collection: "nonconformity_types" }
);

module.exports = mongoose.model("NonconformityType", nonconformityTypeSchema);
