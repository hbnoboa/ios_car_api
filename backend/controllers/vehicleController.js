const vehicleModel = require("../models/vehicleModel");
require("pdfkit-table");
const { generateVehiclePDF } = require("../services/pdf/vehicleReport");
const { generateVehiclesPDF } = require("../services/pdf/vehiclesReport");

module.exports.getVehicles = async (req, res) => {
  const {
    ship_and_travel,
    chassis,
    model,
    situation,
    nonconformity,
    done,
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
  if (done && ["yes", "no"].includes(done.toLowerCase())) {
    query.done = done.toLowerCase();
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
      console.error("Erro no PUT /vehicles/:id:", err); // <-- Adicione isto
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

module.exports.vehiclesPDF = async (req, res) => {
  try {
    const {
      ship_and_travel,
      chassis,
      model,
      situation,
      nonconformity,
      done,
      start_date,
      end_date,
    } = req.query;

    const query = {};

    // ship_and_travel no formato "SHIP-TRAVEL"
    if (ship_and_travel) {
      const [ship, travel] = String(ship_and_travel).split("-");
      if (ship) query.ship = new RegExp(`^${ship.trim()}`, "i");
      if (travel) query.travel = new RegExp(`^${travel.trim()}`, "i");
    }

    if (chassis) query.chassis = { $regex: chassis, $options: "i" };
    if (model) query.model = { $regex: model, $options: "i" };
    if (situation) query.situation = { $regex: situation, $options: "i" };
    if (nonconformity == "0") {
      query.nonconformity = { $gt: 0 };
    }
    if (done && ["yes", "no"].includes(done.toLowerCase())) {
      query.done = done.toLowerCase();
    }
    if (start_date || end_date) {
      // Mantém compatível com o index (usa updated_at, se existir na base)
      const from = start_date ? new Date(start_date) : null;
      const to = end_date ? new Date(end_date) : null;
      if (from || to) {
        query.$and = query.$and || [];
        const range = {};
        if (from) range.$gte = from;
        if (to) range.$lte = to;
        // tenta em updated_at, senão usa updatedAt
        query.$and.push({ $or: [{ updated_at: range }, { updatedAt: range }] });
      }
    }

    const vehicles = await vehicleModel
      .find(query)
      .populate("nonconformities")
      .sort({ updatedAt: -1, updated_at: -1 });

    await generateVehiclesPDF(req, res, vehicles);
  } catch (err) {
    console.error("vehiclesPDF error:", err);
    if (!res.headersSent && !res.writableEnded) {
      return res.status(400).json({ error: err.message });
    }
    // se já começou a enviar o PDF, apenas finalize silenciosamente
    try {
      res.end();
    } catch {}
  }
};

module.exports.vehiclePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await vehicleModel.findById(id).populate("nonconformities");
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    await generateVehiclePDF(req, res, vehicle);
  } catch (err) {
    console.error("vehiclePDF error:", err);
    if (!res.headersSent && !res.writableEnded) {
      return res.status(400).json({ error: err.message });
    }
    try {
      res.end();
    } catch {}
  }
};

module.exports.importVehicles = async (req, res) => {
  try {
    // Campos obrigatórios vindos do modal (aplicados a todas as linhas)
    if (!req.body.ship || !req.body.travel || !req.body.location) {
      return res.status(400).json({
        error: "Campos ship, travel e location são obrigatórios",
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const ext = (req.file.originalname.split(".").pop() || "").toLowerCase();
    let rows = [];

    if (ext === "json") {
      try {
        const text = req.file.buffer.toString("utf8");
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) rows = parsed;
        else if (parsed && typeof parsed === "object") rows = [parsed];
      } catch (e) {
        return res.status(400).json({ error: "JSON inválido" });
      }
    } else if (["xlsx", "xls"].includes(ext)) {
      const ExcelJS = require("exceljs");
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(req.file.buffer);
      const ws = wb.worksheets[0];
      const headerMap = {};
      ws.getRow(1).eachCell((cell, col) => {
        headerMap[col] = String(cell.value).trim().toLowerCase();
      });
      ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const obj = {};
        row.eachCell((cell, colNumber) => {
          const key = headerMap[colNumber];
          if (key)
            obj[key] =
              cell.value && cell.value.text ? cell.value.text : cell.value;
        });
        rows.push(obj);
      });
    } else {
      return res
        .status(400)
        .json({ error: "Formato não suportado. Use .json, .xlsx ou .xls" });
    }

    const defaultShip = String(req.body.ship).trim();
    const defaultTravel = String(req.body.travel).trim();
    const defaultLocation = String(req.body.location).trim();

    const normalized = rows
      .map((r) => ({
        chassis: r.chassis ? String(r.chassis).trim() : undefined,
        brand: r.brand ? String(r.brand).trim() : "",
        model: r.model ? String(r.model).trim() : "",
        ship: defaultShip,
        travel: defaultTravel,
        location: defaultLocation,
        done: "no",
      }))
      .filter((r) => r.chassis);

    if (!normalized.length) {
      return res
        .status(400)
        .json({ error: "Nenhum registro válido encontrado" });
    }

    const chassisList = [...new Set(normalized.map((r) => r.chassis))];
    const existing = await vehicleModel
      .find({ chassis: { $in: chassisList } }, { chassis: 1 })
      .lean();
    const existingSet = new Set(existing.map((e) => e.chassis));

    const toInsert = normalized.filter((r) => !existingSet.has(r.chassis));

    let created = [];
    if (toInsert.length) {
      created = await vehicleModel.insertMany(toInsert, { ordered: false });
      const io = req.app.get("io");
      created.forEach((v) => io.emit("vehicleCreated", v));
    }

    res.json({
      total_linhas_arquivo: rows.length,
      registros_validos: normalized.length,
      ja_existiam: normalized.length - toInsert.length,
      criados: created.length,
      ship: defaultShip,
      travel: defaultTravel,
      location: defaultLocation,
    });
  } catch (err) {
    console.error("importVehicles error:", err);
    res.status(500).json({ error: err.message });
  }
};
