const Vehicle = require("../models/vehicleModel");
const mongoose = require("mongoose");

// Criar uma nova não conformidade (adicionando ao array do veículo)
module.exports.postNonconformity = async (req, res) => {
  const newNonconformityData = req.body;

  try {
    // 1. Encontre o veículo primeiro
    const vehicle = await Vehicle.findById(req.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Veículo não encontrado" });
    }

    // 2. Adicione a nova não conformidade ao array
    vehicle.nonconformities.push(newNonconformityData);

    // 3. Salve o documento do veículo inteiro
    const updatedVehicle = await vehicle.save();

    // Pega a última não conformidade adicionada para emitir no socket
    const createdNonconformity = updatedVehicle.nonconformities.slice(-1)[0];
    req.app.get("io")?.emit("nonconformityCreated", createdNonconformity);
    req.app.get("io")?.emit("vehicleUpdated", updatedVehicle);

    res.status(201).json({
      status: "nonconformity created",
      data: { nonconformity: createdNonconformity },
    });
  } catch (err) {
    // Adiciona um log para ver o erro de validação exato
    console.error("Erro ao criar não conformidade:", err);
    res.status(400).json({ message: err.message });
  }
};

// Deletar uma não conformidade (removendo do array do veículo)
module.exports.deleteNonconformity = async (req, res) => {
  const { id } = req.params; // ID da não conformidade

  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.vehicleId,
      { $pull: { nonconformities: { _id: id } } },
      { new: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Veículo não encontrado" });
    }

    req.app
      .get("io")
      ?.emit("nonconformityDeleted", { _id: id, vehicleId: req.vehicleId });
    req.app.get("io")?.emit("vehicleUpdated", updatedVehicle);

    res.status(200).json({ status: "nonconformity deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Listar todas as não conformidades de um veículo
module.exports.getNonconformities = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.vehicleId).select(
      "nonconformities"
    );
    if (!vehicle) {
      return res.status(404).json({ message: "Veículo não encontrado" });
    }
    res.status(200).json({ nonconformities: vehicle.nonconformities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obter uma não conformidade específica
module.exports.getNonconformity = async (req, res) => {
  const { id } = req.params;
  try {
    const vehicle = await Vehicle.findOne(
      { _id: req.vehicleId, "nonconformities._id": id },
      { "nonconformities.$": 1 }
    );
    if (!vehicle || vehicle.nonconformities.length === 0) {
      return res
        .status(404)
        .json({ message: "Não conformidade não encontrada" });
    }
    res.status(200).json({ nonconformity: vehicle.nonconformities[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Atualizar uma não conformidade
module.exports.putNonconformity = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updateFields = {};

  // Prepara o objeto de atualização para o subdocumento
  for (const key in updateData) {
    updateFields[`nonconformities.$.${key}`] = updateData[key];
  }

  try {
    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { _id: req.vehicleId, "nonconformities._id": id },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedVehicle) {
      return res
        .status(404)
        .json({ message: "Não conformidade não encontrada" });
    }

    const updatedNonconformity = updatedVehicle.nonconformities.find(
      (nc) => nc._id.toString() === id
    );
    req.app.get("io")?.emit("nonconformityUpdated", updatedNonconformity);
    req.app.get("io")?.emit("vehicleUpdated", updatedVehicle);

    res.status(200).json({
      status: "nonconformity updated",
      data: {
        nonconformity: updatedNonconformity,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "nonconformity not updated",
      message: err,
    });
  }
};
