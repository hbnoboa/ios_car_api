const vehicleModel = require("../models/vehicleModel");

module.exports.getVehicles = async (req, res) => {
  const {
    ship_and_travel,
    chassis,
    model,
    situation,
    nonconformity,
    start_date,
    end_date,
    page = 1,
    limit = 10,
  } = req.query;
  const query = {};

  if (ship_and_travel) {
    const [ship, travel] = ship_and_travel.split("-");
    if (ship) query.ship = ship.trim();
    if (travel) query.travel = travel.trim();
  }
  if (chassis) query.chassis = { $regex: chassis, $options: "i" };
  if (model) query.model = { $regex: model, $options: "i" };
  if (situation) query.situation = { $regex: situation, $options: "i" };
  if (nonconformity == "0") {
    query.nonconformity = { $gt: 0 };
  }
  if (start_date || end_date) {
    query.updated_at = {};
    if (start_date) query.updated_at.$gte = new Date(start_date);
    if (end_date) query.updated_at.$lte = new Date(end_date);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [vehicles, total] = await Promise.all([
    vehicleModel
      .find(query)
      .sort({ updatedAt: -1, updated_at: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    vehicleModel.countDocuments(query),
  ]);

  res.json({
    vehicles,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
  });
};

module.exports.getNotDoneVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleModel
      .find({ done: "no" })
      .sort({ updatedAt: -1, updated_at: -1 });
    res.json({ vehicles });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports.getVehicle = (req, res) => {
  const { id } = req.params;
  vehicleModel
    .findById(id)
    .then((data) => {
      res.status(200).json({
        status: "vehicle found",
        data: {
          vehicle: data,
        },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "vehicle not found",
        message: err,
      });
    });
};

module.exports.postVehicle = (req, res) => {
  vehicleModel
    .create(req.body)
    .then((data) => {
      console.log("🚗 EMITINDO vehicleCreated para:", data._id);
      req.app.get("io").emit("vehicleCreated", data);
      res.status(200).json({
        status: "vehicle created",
        data: { vehicle: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "vehicle not created",
        message: err,
      });
    });
};

module.exports.putVehicle = (req, res) => {
  vehicleModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((data) => {
      console.log("✏️ EMITINDO vehicleUpdated para:", data._id);
      req.app.get("io").emit("vehicleUpdated", data);
      res.status(200).json({
        status: "vehicle updated",
        data: { vehicle: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "vehicle not updated",
        message: err,
      });
    });
};

module.exports.deleteVehicle = (req, res) => {
  vehicleModel
    .findByIdAndDelete(req.params.id)
    .then((data) => {
      console.log("🗑️ EMITINDO vehicleDeleted para:", data._id);
      req.app.get("io").emit("vehicleDeleted", data);
      res.status(200).json({
        status: "vehicle deleted",
        data: { vehicle: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "vehicle not deleted",
        message: err,
      });
    });
};

module.exports.getShipsTravels = async (req, res) => {
  try {
    const ships = await vehicleModel.distinct("ship");
    let result = [];
    for (const ship of ships) {
      if (!ship) continue;
      const travels = await vehicleModel.find({ ship }).distinct("travel");
      result = result.concat(
        travels
          .filter((travel) => travel)
          .map((travel) => ({
            label: `${ship} - ${travel}`,
            value: `${ship}-${travel}`,
          }))
      );
    }
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
