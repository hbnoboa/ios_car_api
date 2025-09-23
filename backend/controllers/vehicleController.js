const vehicleModel = require("../models/vehicleModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
require("pdfkit-table");
const sharp = require("sharp"); // ADICIONE

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
    const vehicles = await vehicleModel
      .find()
      .sort({ updatedAt: -1, updated_at: -1 });

    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
      compress: true,
    });

    let filename = `vehicles.pdf`;
    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);

    // Função para adicionar cabeçalho
    const addHeader = () => {
      doc.image("assets/nexus.jpg", 50, 20, { width: 100, height: 40 });
      doc.fontSize(16).text("Lista de Veículos", 200, 30, { align: "center" });
      doc.moveTo(50, 70).lineTo(545, 70).stroke();
    };

    // Adicionar cabeçalho na primeira página
    addHeader();

    // Posição inicial do conteúdo
    let yPosition = 100;
    const lineHeight = 20;
    const pageHeight = 792; // Altura da página A4
    const bottomMargin = 50;

    vehicles.forEach((vehicle, index) => {
      // Verificar se precisa de nova página
      if (yPosition + lineHeight > pageHeight - bottomMargin) {
        doc.addPage();
        addHeader();
        yPosition = 100;
      }

      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${vehicle.chassis || "N/A"} - ${
            vehicle.model || "N/A"
          } - ${vehicle.situation || "N/A"}`,
          50,
          yPosition
        );

      yPosition += lineHeight;
    });

    // Event listener para adicionar cabeçalho em páginas adicionais
    doc.on("pageAdded", () => {
      addHeader();
    });

    doc.end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports.vehiclePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await vehicleModel.findById(id).populate("nonconformities");
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 70,
        bottom: 0,
        left: 70,
        right: 70,
      },
      compress: true, // ATIVE compressão do PDF
    });

    let filename = `${vehicle.chassis}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);

    const addHeader = () => {
      const boxLeft = doc.page.margins.left;
      const boxTop = doc.page.margins.top;
      const boxWidth = 455;
      const boxHeight = 155;

      doc
        .rect(boxLeft, boxTop, boxWidth, boxHeight)
        .strokeColor("white")
        .stroke();

      doc.image("assets/nexus.jpg", boxLeft, boxTop, {
        width: 170,
      });

      const textBoxLeft = boxLeft + 250;
      const textBoxTop = boxTop + 75;
      const textBoxWidth = 150;
      const textBoxHeight = 50;

      doc
        .rect(textBoxLeft, textBoxTop, textBoxWidth, textBoxHeight)
        .strokeColor("black")
        .stroke();

      doc
        .fontSize(10)
        .text("Relatório de avarias", textBoxLeft + 10, textBoxTop + 25, {
          width: textBoxWidth - 20,
          align: "center",
        });

      const strokeTop = boxTop + 155;

      doc
        .moveTo(doc.page.margins.left, strokeTop)
        .lineTo(doc.page.width - doc.page.margins.right, strokeTop)
        .stroke();
    };

    addHeader();

    doc.on("pageAdded", () => {
      addHeader();
    });

    doc.x = doc.page.margins.left + 5;
    doc.y = doc.page.margins.top + 155;

    const chassisX = doc.x;
    const chassisY = doc.y + 15;
    doc.font("Helvetica").fontSize(10).text(`Chassi: `, chassisX, chassisY);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(vehicle.chassis, chassisX + 40, chassisY);

    const modelX = chassisX;
    const modelY = chassisY + 15;
    doc.font("Helvetica").fontSize(10).text(`Modelo: `, modelX, modelY);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(vehicle.model, modelX + 40, modelY);

    doc
      .moveTo(doc.page.margins.left, modelY + 20)
      .lineTo(doc.page.width - doc.page.margins.right, modelY + 20)
      .stroke();

    tablex = chassisX - 5;
    tabley = modelY + 30;

    doc.x = tablex;
    doc.y = tabley;
    doc.font("Helvetica-Bold").fontSize(8).text("");

    doc.table({
      rowStyles: [{ height: 20 }],
      columnStyles: { width: [150, 150, 150], padding: [7, 5] },
      data: [["Local", "Navio", "Data/Hora"]],
    });

    doc.font("Helvetica").fontSize(8).text("");
    doc.table({
      rowStyles: [{ height: 20 }],
      columnStyles: { width: [150, 150, 150], padding: [7, 5] },
      data: [
        [
          vehicle.location,
          vehicle.ship,
          vehicle.updatedAt || vehicle.createdAt
            ? new Date(vehicle.updatedAt || vehicle.createdAt).toLocaleString()
            : "",
        ],
      ],
    });
    doc.table({
      rowStyles: [{ height: 20 }],
      columnStyles: { width: [450], padding: [7, 5] },
      data: [[`Observação: ${vehicle.observations || ""}`]],
    });

    table2x = tablex;
    table2y = tabley + 80;

    doc.x = table2x;
    doc.y = table2y;

    doc.font("Helvetica-Bold").fontSize(8).text("");
    doc.table({
      rowStyles: [{ height: 20 }],
      columnStyles: { width: [450], padding: [7, 5] },
      data: [[`Avarias`]],
    });
    doc.table({
      rowStyles: [{ height: 20 }],
      columnStyles: {
        width: [90, 90, 90, 90, 90],
        padding: [7, 5],
        align: "center",
      },
      data: [[`Onde, `, `Local`, `Quadrante`, `Medida`, `Dano`]],
    });

    const tablenonconformity =
      vehicle.nonconformities?.map((nonconformity) => [
        nonconformity.vehicleParts || "",
        nonconformity.nonconformityLocals || "",
        nonconformity.quadrants || "",
        nonconformity.measures || "",
        nonconformity.nonconformityTypes || "",
      ]) || [];

    if (tablenonconformity.length === 0) {
      tablenonconformity.push(["", "", "", "", ""]);
    }

    doc.font("Helvetica").fontSize(8).text("");
    doc.table({
      rowStyles: [{ height: 20 }],
      columnStyles: {
        width: [90, 90, 90, 90, 90],
        padding: [7, 5],
        align: "center",
      },
      data: tablenonconformity,
    });

    table3x = table2x;
    table3y = table2y + 60;

    doc.x = table3x;
    doc.y += 20;

    // Cabeçalho da última tabela de imagens
    doc.font("Helvetica-Bold").fontSize(8).text("");
    doc.table({
      defaultStyle: { border: false },
      rowStyles: [{ height: 20 }],
      columnStyles: {
        width: [112.5, 112.5, 112.5, 112.5],
        padding: [7, 5],
        align: "center",
      },
      data: [["CHASSI", "VEÍCULO", "AVARIA 1", "AVARIA 2"]],
    });

    // --- Carregar imagens pela própria API (/api/images/:filename) ---
    const imageRowHeight = 80;
    const imageWidth = 90; // em points (PDF)
    const columnWidth = 112.5;
    const startX = doc.page.margins.left;
    const baseURL = `${req.protocol}://${req.get("host")}`;

    // Baixa a imagem via HTTP/HTTPS e retorna Buffer (ou null)
    const fetchImageBuffer = async (filename) => {
      if (!filename) return null;
      const url = `${baseURL}/api/images/${encodeURIComponent(filename)}`;
      const useHttps = url.startsWith("https");
      const lib = useHttps ? require("https") : require("http");

      return new Promise((resolve) => {
        const reqImg = lib.get(url, (resp) => {
          if (resp.statusCode !== 200) {
            resp.resume();
            return resolve(null);
          }
          const chunks = [];
          resp.on("data", (c) => chunks.push(c));
          resp.on("end", () => resolve(Buffer.concat(chunks)));
        });
        reqImg.on("error", () => resolve(null));
      });
    };

    // Recompressão/redimensionamento para reduzir peso
    const optimizeImageBuffer = async (buffer) => {
      if (!buffer) return null;
      const targetPx = Math.round(imageWidth * 2); // ~180px de largura
      try {
        return await sharp(buffer)
          .rotate()
          .resize({ width: targetPx, withoutEnlargement: true })
          .jpeg({ quality: 60, mozjpeg: true, chromaSubsampling: "4:2:0" })
          .toBuffer();
      } catch {
        return buffer; // fallback
      }
    };

    // Desenha uma linha de 4 colunas com possíveis imagens (paraleliza downloads e compressão)
    const drawImageRow = async (files) => {
      const currentY = doc.y;
      if (currentY + imageRowHeight > doc.page.height - 50) {
        doc.addPage();
        doc.y = doc.page.margins.top + 180;
      }

      const rowY = doc.y;

      // Baixa e otimiza em paralelo
      const buffers = await Promise.all(
        files.map((f) => (f ? fetchImageBuffer(f) : Promise.resolve(null)))
      );
      const processed = await Promise.all(
        buffers.map((b) => (b ? optimizeImageBuffer(b) : Promise.resolve(null)))
      );

      // Desenha
      for (let i = 0; i < 4; i++) {
        const buffer = processed[i];
        if (!buffer) continue;

        const imgX = startX + i * columnWidth + (columnWidth - imageWidth) / 2;
        const imgY = rowY + (imageRowHeight - imageWidth * 0.75) / 2;
        try {
          doc.image(buffer, imgX, imgY, {
            width: imageWidth,
            height: imageWidth * 0.75,
          });
        } catch (err) {
          console.error(
            "Erro ao desenhar imagem no PDF:",
            files[i],
            err.message
          );
        }
      }

      doc.y = rowY + imageRowHeight;
    };

    const ncs = vehicle.nonconformities || [];

    if (ncs.length === 0) {
      await drawImageRow([
        vehicle.etChassisImageFilename || null,
        vehicle.profileImageFilename || null,
        null,
        null,
      ]);
    } else {
      for (let index = 0; index < ncs.length; index++) {
        const nc = ncs[index];
        await drawImageRow([
          index === 0 ? vehicle.etChassisImageFilename || null : null,
          index === 0 ? vehicle.profileImageFilename || null : null,
          nc.image1 || null,
          nc.image2 || null,
        ]);
      }
    }

    doc.end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
