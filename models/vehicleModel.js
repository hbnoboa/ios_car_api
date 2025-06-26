const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    chassis: { type: String, required: true, unique: true },
    location: { type: String },
    type: { type: String },
    nonconformity: { type: Number, default: 0 },
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

    nonconformities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Nonconformity" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
