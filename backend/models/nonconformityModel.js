const mongoose = require("mongoose");

const nonconformitySchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    image1: { type: String },
    image2: { type: String },
    image3: { type: String },
    image4: { type: String },

    vehicleParts: { type: String },
    nonconformityTypes: { type: String },
    nonconformityLevels: { type: String },
    quadrants: { type: String },
    measures: { type: String },
    nonconformityLocals: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Nonconformity", nonconformitySchema);
