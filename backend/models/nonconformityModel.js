const mongoose = require("mongoose");

const nonconformitySchema = new mongoose.Schema(
  {
    vehicleParts: { type: String },
    nonconformityTypes: { type: String },
    nonconformityLevels: { type: String },
    quadrants: { type: String },
    measures: { type: String },
    nonconformityLocals: { type: String },
    image1: { type: String },
    image2: { type: String },
  },
  { timestamps: true }
);

module.exports = nonconformitySchema;
