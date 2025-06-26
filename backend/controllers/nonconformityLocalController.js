const nonconformityLocalModel = require("../models/nonconformityLocalModel");

module.exports.getNonconformityLocals = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [nonconformityLocals, total] = await Promise.all([
    nonconformityLocalModel.find().sort({ _id: -1 }).skip(skip).limit(limit),
    nonconformityLocalModel.countDocuments(),
  ]);

  res.json({
    nonconformityLocals,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

module.exports.getNonconformityLocal = (req, res) => {
  const { id } = req.params;
  nonconformityLocalModel
    .findById(id)
    .then((data) => {
      res.status(200).json({
        status: "nonconformity local found",
        data: { nonconformityLocal: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity local not found",
        message: err,
      });
    });
};

module.exports.postNonconformityLocal = (req, res) => {
  nonconformityLocalModel
    .create(req.body)
    .then((data) => {
      res.status(200).json({
        status: "nonconformity local created",
        data: { nonconformityLocal: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity local not created",
        message: err,
      });
    });
};

module.exports.putNonconformityLocal = (req, res) => {
  nonconformityLocalModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((data) => {
      res.status(200).json({
        status: "nonconformity local updated",
        data: { nonconformityLocal: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity local not updated",
        message: err,
      });
    });
};

module.exports.deleteNonconformityLocal = (req, res) => {
  nonconformityLocalModel
    .findByIdAndDelete(req.params.id)
    .then((data) => {
      res.status(200).json({
        status: "nonconformity local deleted",
        data: { nonconformityLocal: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity local not deleted",
        message: err,
      });
    });
};
