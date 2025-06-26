const mongoose = require("mongoose");

const vehiclePartSchema = new mongoose.Schema(
  {
    area: Number,
    name: String,
  },
  { timestamps: true, collection: "vehicle_parts" } // <-- set collection name here
);

module.exports = mongoose.model("VehiclePart", vehiclePartSchema);
