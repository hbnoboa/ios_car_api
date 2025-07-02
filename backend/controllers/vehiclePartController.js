const vehiclePartModel = require("../models/vehiclePartModel");

module.exports.getVehicleParts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [vehicleParts, total] = await Promise.all([
    vehiclePartModel.find().sort({ area: 1, name: 1 }).skip(skip),
    vehiclePartModel.countDocuments(),
  ]);

  res.json({
    vehicleParts,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

module.exports.getVehiclePart = (req, res) => {
  const { id } = req.params;
  vehiclePartModel
    .findById(id)
    .then((data) => {
      res.status(200).json({
        status: "vehicle part found",
        data: {
          vehiclePart: data,
        },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "vehicle part not found",
        message: err,
      });
    });
};

module.exports.postVehiclePart = (req, res) => {
  vehiclePartModel
    .create(req.body)
    .then((data) => {
      res.status(200).json({
        status: "vehicle part created",
        data: { vehiclePart: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "vehicle part not created",
        message: err,
      });
    });
};

module.exports.putVehiclePart = (req, res) => {
  vehiclePartModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((data) => {
      res.status(200).json({
        status: "vehicle part updated",
        data: { vehiclePart: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "vehicle part not updated",
        message: err,
      });
    });
};

module.exports.deleteVehiclePart = (req, res) => {
  vehiclePartModel
    .findByIdAndDelete(req.params.id)
    .then((data) => {
      res.status(200).json({
        status: "vehicle part deleted",
        data: { vehiclePart: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "vehicle part not deleted",
        message: err,
      });
    });
};
