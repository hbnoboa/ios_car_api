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

    et_chassis_image_filename: { type: String },
    et_chassis_image_gridfs_id: { type: String },

    profile_image_filename: { type: String },
    profile_image_gridfs_id: { type: String },

    front_image_filename: { type: String },
    front_image_gridfs_id: { type: String },

    back_image_filename: { type: String },
    back_image_gridfs_id: { type: String },

    nonconformities: { type: [nonconformitySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
