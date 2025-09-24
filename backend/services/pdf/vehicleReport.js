const PDFDocument = require("pdfkit");
require("pdfkit-table");
const sharp = require("sharp");

async function generateVehiclePDF(req, res, vehicle) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 70, bottom: 0, left: 70, right: 70 },
    compress: true,
  });

  const filename = `${vehicle.chassis}.pdf`;
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
    doc.image("assets/nexus.jpg", boxLeft, boxTop, { width: 170 });

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

    const strokeTop = boxTop + boxHeight;
    doc
      .moveTo(doc.page.margins.left, strokeTop)
      .lineTo(doc.page.width - doc.page.margins.right, strokeTop)
      .stroke();
  };

  addHeader();
  doc.on("pageAdded", addHeader);

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

  let tablex = chassisX - 5;
  let tabley = modelY + 30;

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

  let table2x = tablex;
  let table2y = tabley + 80;
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
    vehicle.nonconformities?.map((non) => [
      non.vehicleParts || "",
      non.nonconformityLocals || "",
      non.quadrants || "",
      non.measures || "",
      non.nonconformityTypes || "",
    ]) || [];

  if (tablenonconformity.length === 0)
    tablenonconformity.push(["", "", "", "", ""]);

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

  let table3x = table2x;
  let table3y = table2y + 60;
  doc.x = table3x;
  doc.y += 20;

  // Cabeçalho da tabela de imagens
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

  // Helpers de imagem
  const imageRowHeight = 80;
  const imageWidth = 90;
  const columnWidth = 112.5;
  const startX = doc.page.margins.left;
  const baseURL = `${req.protocol}://${req.get("host")}`;

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

  const optimizeImageBuffer = async (buffer) => {
    if (!buffer) return null;
    const targetPx = Math.round(imageWidth * 2); // ~180px
    try {
      return await sharp(buffer)
        .rotate()
        .resize({ width: targetPx, withoutEnlargement: true })
        .jpeg({ quality: 60, mozjpeg: true, chromaSubsampling: "4:2:0" })
        .toBuffer();
    } catch {
      return buffer;
    }
  };

  const drawImageRow = async (files) => {
    const currentY = doc.y;
    if (currentY + imageRowHeight > doc.page.height - 50) {
      doc.addPage();
      doc.y = doc.page.margins.top + 180;
    }

    const rowY = doc.y;

    const buffers = await Promise.all(
      files.map((f) => (f ? fetchImageBuffer(f) : Promise.resolve(null)))
    );
    const processed = await Promise.all(
      buffers.map((b) => (b ? optimizeImageBuffer(b) : Promise.resolve(null)))
    );

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
        console.error("Erro ao desenhar imagem no PDF:", files[i], err.message);
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
    for (let i = 0; i < ncs.length; i++) {
      const nc = ncs[i];
      await drawImageRow([
        i === 0 ? vehicle.etChassisImageFilename || null : null,
        i === 0 ? vehicle.profileImageFilename || null : null,
        nc.image1 || null,
        nc.image2 || null,
      ]);
    }
  }

  doc.end();
  return new Promise((resolve) => doc.on("end", resolve));
}

module.exports = { generateVehiclePDF };
