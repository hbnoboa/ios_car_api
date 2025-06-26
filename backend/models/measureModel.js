const mongoose = require("mongoose");

const measureSchema = new mongoose.Schema(
  {
    size: String,
  },
  { timestamps: true, collection: "measures" }
);

module.exports = mongoose.model("Measure", measureSchema);
