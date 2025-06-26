const quadrantModel = require("../models/quadrantModel");

module.exports.getQuadrants = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [quadrants, total] = await Promise.all([
    quadrantModel.find().sort({ _id: -1 }).skip(skip).limit(limit),
    quadrantModel.countDocuments(),
  ]);

  res.json({
    quadrants,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

module.exports.getQuadrant = (req, res) => {
  const { id } = req.params;
  quadrantModel
    .findById(id)
    .then((data) => {
      res.status(200).json({
        status: "quadrant found",
        data: { quadrant: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "quadrant not found",
        message: err,
      });
    });
};

module.exports.postQuadrant = (req, res) => {
  quadrantModel
    .create(req.body)
    .then((data) => {
      res.status(200).json({
        status: "quadrant created",
        data: { quadrant: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "quadrant not created",
        message: err,
      });
    });
};

module.exports.putQuadrant = (req, res) => {
  quadrantModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((data) => {
      res.status(200).json({
        status: "quadrant updated",
        data: { quadrant: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "quadrant not updated",
        message: err,
      });
    });
};

module.exports.deleteQuadrant = (req, res) => {
  quadrantModel
    .findByIdAndDelete(req.params.id)
    .then((data) => {
      res.status(200).json({
        status: "quadrant deleted",
        data: { quadrant: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "quadrant not deleted",
        message: err,
      });
    });
};
