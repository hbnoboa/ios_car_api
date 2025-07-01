const Nonconformity = require("../models/nonconformityModel");
const mongoose = require("mongoose");

module.exports.getNonconformities = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const vehicleId = req.vehicleId;

  try {
    const filter = {
      $or: [
        { vehicle: new mongoose.Types.ObjectId(vehicleId) },
        { vehicle_id: new mongoose.Types.ObjectId(vehicleId) },
      ],
    };

    const [nonconformities, total] = await Promise.all([
      Nonconformity.find(filter).sort({ _id: -1 }).skip(skip).limit(limit),
      Nonconformity.countDocuments(filter),
    ]);

    res.json({
      nonconformities,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// GET a single nonconformity by id for a vehicle
module.exports.getNonconformity = (req, res) => {
  Nonconformity.findOne({
    _id: req.params.id,
    $or: [
      { vehicle: req.params.vehicleId },
      { vehicle_id: req.params.vehicleId },
    ],
  })
    .then((data) => {
      res.status(200).json({
        status: "nonconformity found",
        data: {
          nonconformity: data,
        },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity not found",
        message: err,
      });
    });
};

module.exports.postNonconformity = (req, res) => {
  console.log("POST nonconformity - body:", req.body);
  Nonconformity.create({ ...req.body, vehicle: req.vehicleId })
    .then((data) => {
      req.app.get("io")?.emit("nonconformityCreated", data);
      res.status(200).json({
        status: "nonconformity created",
        data: { nonconformity: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity not created",
        message: err,
      });
    });
};

module.exports.putNonconformity = (req, res) => {
  Nonconformity.findOneAndUpdate(
    { _id: req.params.id, vehicle: req.params.vehicleId },
    req.body,
    { new: true }
  )
    .then((data) => {
      req.app.get("io")?.emit("nonconformityUpdated", data);
      res.status(200).json({
        status: "nonconformity updated",
        data: {
          nonconformity: data,
        },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity not updated",
        message: err,
      });
    });
};

// DELETE a nonconformity by id for a vehicle
module.exports.deleteNonconformity = (req, res) => {
  Nonconformity.findOneAndDelete({
    _id: req.params.id,
    vehicle: req.params.vehicleId,
  })
    .then((data) => {
      req.app.get("io")?.emit("nonconformityDeleted", data);
      res.status(200).json({
        status: "nonconformity deleted",
        data: {
          nonconformity: data,
        },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity not deleted",
        message: err,
      });
    });
};
