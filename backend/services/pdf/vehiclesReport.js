const PDFDocument = require("pdfkit");
require("pdfkit-table");
const sharp = require("sharp");

async function generateVehiclesPDF(req, res, vehicles) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 70, bottom: 50, left: 50, right: 50 },
    compress: true,
  });

  const filename = `vehicles.pdf`;
  res.setHeader("Content-disposition", `attachment; filename=${filename}`);
  res.setHeader("Content-type", "application/pdf");
  doc.pipe(res);

  // Helpers gerais
  const ptDate = (d, withTime = true) => {
    if (!d) return "";
    const date = new Date(d);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(date);
  };

  const addHeader = () => {
    const boxLeft = doc.page.margins.left;
    const boxTop = doc.page.margins.top;
    const boxWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const boxHeight = 105;

    doc
      .rect(boxLeft, boxTop, boxWidth, boxHeight)
      .strokeColor("white")
      .stroke();

    try {
      doc.image("assets/nexus.jpg", boxLeft, boxTop, { width: 120 });
    } catch (_) {
      // ignora se não existir
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("RELATÓRIO DE INSPEÇÃO", boxLeft + 140, boxTop + 36, {
        width: boxWidth - 140,
        align: "left",
      });

    const strokeTop = boxTop + boxHeight;
    doc
      .moveTo(doc.page.margins.left, strokeTop)
      .lineTo(doc.page.width - doc.page.margins.right, strokeTop)
      .stroke();
  };

  const addFooter = () => {
    const y = doc.page.height - doc.page.margins.bottom + 15;
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("black")
      .text(
        "IOS – Inteligência em Operações Sustentáveis",
        doc.page.margins.left,
        y,
        {
          align: "left",
          width:
            doc.page.width - doc.page.margins.left - doc.page.margins.right,
        }
      );
  };

  addHeader();
  addFooter();
  doc.on("pageAdded", () => {
    addHeader();
    addFooter();
  });

  // Posição inicial após cabeçalho
  doc.x = doc.page.margins.left;
  doc.y = doc.page.margins.top + 120;

  // Dados gerais derivados
  const has = (v) =>
    Array.isArray(v?.nonconformities)
      ? v.nonconformities.length > 0
      : Number(v?.nonconformity || 0) > 0;

  const firstByUpdatedAt = [...vehicles].sort(
    (a, b) =>
      new Date(a.updatedAt || a.createdAt || 0) -
      new Date(b.updatedAt || b.createdAt || 0)
  )[0];
  const lastByUpdatedAt = [...vehicles].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt || 0) -
      new Date(a.updatedAt || a.createdAt || 0)
  )[0];

  const first = firstByUpdatedAt || vehicles[0] || {};
  const last = lastByUpdatedAt || vehicles[vehicles.length - 1] || {};

  const ship = first?.ship || "";
  const travel = first?.travel || "";
  const opDate = first?.updatedAt || first?.createdAt || null;
  const startOp = first?.updatedAt || first?.createdAt || null;
  const endOp = last?.updatedAt || last?.createdAt || null;

  // 1 – INFORMAÇÃO GERAL
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("1 – INFORMAÇÃO GERAL", { align: "center" });
  doc.moveDown(0.5);

  const left = doc.page.margins.left;
  const topBoxY = doc.y + 5;
  const label = (t, x, y) =>
    doc.font("Helvetica-Bold").fontSize(10).text(t, x, y);
  const value = (t, x, y) => doc.font("Helvetica").fontSize(10).text(t, x, y);

  label("NOME DO NAVIO:", left, topBoxY);
  value(ship, left + 120, topBoxY);
  label("Nº DA VIAGEM:", left, topBoxY + 18);
  value(travel, left + 120, topBoxY + 18);
  label("DATA DA OPERAÇÃO:", left, topBoxY + 36);
  value(ptDate(opDate, false), left + 140, topBoxY + 36);

  doc.y = topBoxY + 60;
  doc.moveDown(0.5);

  // 2 – INFORMAÇÕES DA OPERAÇÃO
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("2 – INFORMAÇÕES DA OPERAÇÃO", { align: "center" });
  doc.moveDown(0.5);
  const infoY = doc.y;

  label("INICIO OPERAÇÃO / DESCARGA:", left, infoY);
  value(ptDate(startOp, true), left + 190, infoY);
  label("FIM OPERAÇÃO DESCARGA:", left, infoY + 18);
  value(ptDate(endOp, true), left + 175, infoY + 18);
  label("QUANTIDADE DE VEÍCULOS:", left, infoY + 36);
  value(`${vehicles.length} VEÍCULOS`, left + 180, infoY + 36);

  const faultyCount = vehicles.filter(has).length;
  label("VEÍCULOS AVARIADOS:", left + 260, infoY + 36);
  value(`${faultyCount} VEÍCULO(S)`, left + 390, infoY + 36);

  doc.y = infoY + 60;
  doc.moveDown(0.5);

  // 3 – ESTATÍSTICA DE DESCARREGAMENTO
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("3 – ESTATÍSTICA DE DESCARREGAMENTO", {
      align: "center",
    });
  doc.moveDown(0.5);

  const grouped = vehicles.reduce((acc, v) => {
    const key = v.model || "";
    acc[key] = acc[key] || {
      brand: v.brand || "",
      model: v.model || "",
      total: 0,
      faulty: 0,
    };
    acc[key].total += 1;
    if (has(v)) acc[key].faulty += 1;
    return acc;
  }, {});

  const statsRows = Object.values(grouped).map((g) => {
    const pct =
      g.total > 0 ? ((g.faulty / g.total) * 100).toFixed(2) + "%" : "";
    return [g.brand || "", g.model || "", g.total, g.faulty, pct];
  });

  const statsHeader = [["MARCA", "MODELO", "Unidades", "Total Avariados", "%"]];
  doc.table(
    {
      data: statsRows.length
        ? statsHeader.concat(statsRows)
        : statsHeader.concat([["", "", "", "", ""]]),
      rowStyles: [{ height: 18 }],
      columnStyles: {
        width: [90, 190, 50, 80, 40],
        padding: [6, 4],
        align: "center",
      },
    },
    {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: (row, iCol, iRow, rectRow) =>
        doc.font("Helvetica").fontSize(9),
    }
  );

  doc.moveDown(1.5);

  // 4 – RELATÓRIO DE AVARIAS
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("4 – RELATÓRIO DE AVARIAS", { align: "center" });
  doc.moveDown(0.5);

  const damageHeader = [["CHASSI", "MODELO", "ÁREA", "QUADRANTE", "DANOS"]];
  const damageRows = [];

  for (const v of vehicles) {
    const ncs = Array.isArray(v.nonconformities) ? v.nonconformities : [];
    for (const non of ncs) {
      damageRows.push([
        String(v.chassis || ""),
        String(v.model || ""),
        String(non.vehicleParts || ""),
        String(non.quadrants || ""),
        String(non.nonconformityTypes || non.nonconformityLevels || ""),
      ]);
    }
  }

  await doc.table(
    {
      data: damageRows.length
        ? damageHeader.concat(damageRows)
        : damageHeader.concat([["", "", "", "", ""]]),
      rowStyles: [{ height: 18 }],
      columnStyles: {
        width: [100, 115, 115, 60, 60],
        padding: [6, 4],
        align: "center",
      },
    },
    {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: () => doc.font("Helvetica").fontSize(9),
    }
  );

  doc.moveDown(1.5);

  // 5 – FOTOS DAS AVARIAS (usa base do vehicleReport com compressão/resize)
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("5 – FOTOS DAS AVARIAS", { align: "center" });
  doc.moveDown(0.5);

  // Cabeçalho da grade de fotos
  const drawPhotosHeader = () => {
    doc.font("Helvetica-Bold").fontSize(8).text("");
    doc.table({
      defaultStyle: { border: false },
      rowStyles: [{ height: 20 }],
      columnStyles: {
        width: [112.5, 112.5, 112.5, 112.5],
        padding: [7, 5],
        align: "center",
      },
      data: [["CHASSI", "VEÍCULO", "PEÇA AVARIADA", "AVARIA"]],
    });
  };

  drawPhotosHeader();

  // Helpers de imagem (reuso da base do vehicleReport)
  const imageRowHeight = 80;
  const imageWidth = 90;
  const columnWidth = 112.5;
  const startX = doc.page.margins.left;
  const baseURL = `${req.protocol}://${req.get("host")}`;

  const fetchImageBuffer = async (filename) => {
    if (!filename) return null;
    const url = `${baseURL}/api/images/${encodeURIComponent(
      filename
    )}?t=${encodeURIComponent(filename)}`;
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
    // quebra de página com redesenho do cabeçalho de fotos
    const needed = imageRowHeight + 20;
    if (doc.y + needed > doc.page.height - doc.page.margins.bottom - 20) {
      doc.addPage();
      doc.y = doc.page.margins.top + 120;
      drawPhotosHeader();
    }
    const rowY = doc.y;

    // bordas leves (opcional, pode remover)
    for (let i = 0; i < 4; i++) {
      doc
        .rect(startX + i * columnWidth, rowY, columnWidth, imageRowHeight)
        .strokeColor("#cccccc")
        .stroke();
    }

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

  const drawCaptionRow = (texts) => {
    // Uma linha de legenda com 4 colunas
    doc.font("Helvetica").fontSize(8).text("");
    doc.table({
      defaultStyle: { border: false },
      rowStyles: [{ height: 16 }],
      columnStyles: {
        width: [112.5, 112.5, 112.5, 112.5],
        padding: [4, 4],
        align: "center",
      },
      data: [texts.map((t) => String(t || ""))],
    });
  };

  // Ordena por data crescente para fotos (similar ao Rails)
  const vehiclesForPhotos = [...vehicles]
    .filter((v) => has(v))
    .sort(
      (a, b) =>
        new Date(a.updatedAt || a.createdAt || 0) -
        new Date(b.updatedAt || b.createdAt || 0)
    );

  for (const v of vehiclesForPhotos) {
    const ncs = Array.isArray(v.nonconformities) ? v.nonconformities : [];
    for (const nc of ncs) {
      await drawImageRow([
        v.etChassisImageFilename || null,
        v.profileImageFilename || null,
        nc.image1 || null,
        nc.image2 || null,
      ]);
      drawCaptionRow([
        v.chassis,
        v.model,
        nc.vehicleParts || "",
        nc.nonconformityTypes || nc.nonconformityLevels || "",
      ]);
    }
  }

  doc.end();
  return new Promise((resolve) => doc.on("end", resolve));
}

module.exports = { generateVehiclesPDF };
