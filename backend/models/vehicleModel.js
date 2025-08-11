const mongoose = require("mongoose");
const nonconformitySchema = require("./nonconformityModel"); // Importe o schema

const vehicleSchema = new mongoose.Schema(
  {
    chassis: { type: String, required: true, unique: true },
    location: { type: String },
    type: { type: String },
    brand: { type: String },
    travel: { type: String },
    model: { type: String },
    status: { type: String },
    ship: { type: String },
    situation: { type: String },
    observations: { type: String },
    done: { type: String, default: "no" },
    etChassisImageFilename: { type: String, default: "" },
    profileImageFilename: { type: String, default: "" },
    nonconformities: { type: [nonconformitySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
