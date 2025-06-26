const mongoose = require("mongoose");

const quadrantSchema = new mongoose.Schema(
  {
    option: Number,
  },
  { timestamps: true, collection: "quadrants" }
);

module.exports = mongoose.model("Quadrant", quadrantSchema);
