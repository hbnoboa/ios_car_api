const nonconformityLevelModel = require("../models/nonconformityLevelModel");

module.exports.getNonconformityLevels = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [nonconformityLevels, total] = await Promise.all([
    nonconformityLevelModel.find().sort({ _id: -1 }).skip(skip).limit(limit),
    nonconformityLevelModel.countDocuments(),
  ]);

  res.json({
    nonconformityLevels,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

module.exports.getNonconformityLevel = (req, res) => {
  const { id } = req.params;
  nonconformityLevelModel
    .findById(id)
    .then((data) => {
      res.status(200).json({
        status: "nonconformity level found",
        data: { nonconformityLevel: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity level not found",
        message: err,
      });
    });
};

module.exports.postNonconformityLevel = (req, res) => {
  nonconformityLevelModel
    .create(req.body)
    .then((data) => {
      res.status(200).json({
        status: "nonconformity level created",
        data: { nonconformityLevel: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity level not created",
        message: err,
      });
    });
};

module.exports.putNonconformityLevel = (req, res) => {
  nonconformityLevelModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((data) => {
      res.status(200).json({
        status: "nonconformity level updated",
        data: { nonconformityLevel: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity level not updated",
        message: err,
      });
    });
};

module.exports.deleteNonconformityLevel = (req, res) => {
  nonconformityLevelModel
    .findByIdAndDelete(req.params.id)
    .then((data) => {
      res.status(200).json({
        status: "nonconformity level deleted",
        data: { nonconformityLevel: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity level not deleted",
        message: err,
      });
    });
};
