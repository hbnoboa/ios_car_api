const measureModel = require("../models/measureModel");

module.exports.getMeasures = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [measures, total] = await Promise.all([
    measureModel.find().sort({ _id: -1 }).skip(skip).limit(limit),
    measureModel.countDocuments(),
  ]);

  res.json({
    measures,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

module.exports.getMeasure = (req, res) => {
  const { id } = req.params;
  measureModel
    .findById(id)
    .then((data) => {
      res.status(200).json({
        status: "measure found",
        data: { measure: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "measure not found",
        message: err,
      });
    });
};

module.exports.postMeasure = (req, res) => {
  measureModel
    .create(req.body)
    .then((data) => {
      res.status(200).json({
        status: "measure created",
        data: { measure: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "measure not created",
        message: err,
      });
    });
};

module.exports.putMeasure = (req, res) => {
  measureModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((data) => {
      res.status(200).json({
        status: "measure updated",
        data: { measure: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "measure not updated",
        message: err,
      });
    });
};

module.exports.deleteMeasure = (req, res) => {
  measureModel
    .findByIdAndDelete(req.params.id)
    .then((data) => {
      res.status(200).json({
        status: "measure deleted",
        data: { measure: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "measure not deleted",
        message: err,
      });
    });
};
