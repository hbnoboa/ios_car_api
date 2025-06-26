const nonconformityTypeModel = require("../models/nonconformityTypeModel");

module.exports.getNonconformityTypes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [nonconformityTypes, total] = await Promise.all([
    nonconformityTypeModel.find().sort({ _id: -1 }).skip(skip).limit(limit),
    nonconformityTypeModel.countDocuments(),
  ]);

  res.json({
    nonconformityTypes,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

module.exports.getNonconformityType = (req, res) => {
  const { id } = req.params;
  nonconformityTypeModel
    .findById(id)
    .then((data) => {
      res.status(200).json({
        status: "nonconformity type found",
        data: { nonconformityType: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity type not found",
        message: err,
      });
    });
};

module.exports.postNonconformityType = (req, res) => {
  nonconformityTypeModel
    .create(req.body)
    .then((data) => {
      res.status(200).json({
        status: "nonconformity type created",
        data: { nonconformityType: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity type not created",
        message: err,
      });
    });
};

module.exports.putNonconformityType = (req, res) => {
  nonconformityTypeModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((data) => {
      res.status(200).json({
        status: "nonconformity type updated",
        data: { nonconformityType: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity type not updated",
        message: err,
      });
    });
};

module.exports.deleteNonconformityType = (req, res) => {
  nonconformityTypeModel
    .findByIdAndDelete(req.params.id)
    .then((data) => {
      res.status(200).json({
        status: "nonconformity type deleted",
        data: { nonconformityType: data },
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "nonconformity type not deleted",
        message: err,
      });
    });
};
