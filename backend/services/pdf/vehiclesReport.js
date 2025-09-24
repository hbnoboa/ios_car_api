const PDFDocument = require("pdfkit");
require("pdfkit-table");
const sharp = require("sharp");

async function generateVehiclesPDF(req, res, vehicles) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 70, bottom: 70, left: 70, right: 70 },
    compress: true,
  });

  const filename = `chassis.pdf`;
  res.setHeader("Content-disposition", `attachment; filename=${filename}`);
  res.setHeader("Content-type", "application/pdf");
  doc.pipe(res);

  const HEADER_IMG_WIDTH = 80;
  const HEADER_EXTRA_GAP = 25; // espaço abaixo do header
  const CONTENT_START_Y =
    doc.page.margins.top + HEADER_IMG_WIDTH + HEADER_EXTRA_GAP;

  const addHeader = () => {
    const pageWidth = doc.page.width;
    const x = (pageWidth - HEADER_IMG_WIDTH) / 2;
    doc.image("assets/nexus.jpg", x, doc.page.margins.top, {
      width: HEADER_IMG_WIDTH,
    });
  };

  // Primeira página
  addHeader();
  doc.x = doc.page.margins.left;
  doc.y = CONTENT_START_Y;

  // Ajuste para páginas seguintes
  doc.on("pageAdded", () => {
    addHeader();
    doc.x = doc.page.margins.left;
    doc.y = CONTENT_START_Y;
  });

  const inspectionX = doc.x;
  const inspectionY = doc.y;

  doc.fontSize(10).text("RELATÓRIO DE INSPEÇÃO", inspectionX, inspectionY);

  const generalX = inspectionX;
  const generalY = inspectionY + 45;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("1 - INFORMAÇÃO GERAL", generalX, generalY, { align: "center" });

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("NOME DO NAVIO:", generalX, generalY + 20);
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(vehicles[0]?.ship || "", generalX + 90, generalY + 20);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Nº DA VIAGEM:", generalX, generalY + 40);
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(vehicles[0]?.travel || "", generalX + 75, generalY + 40);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("DATA DA OPERAÇÃO:", generalX, generalY + 60);
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(
      vehicles[0]?.updatedAt.toLocaleDateString() ||
        vehicles[0]?.updated_at.toLocaleDateString(),
      generalX + 110,
      generalY + 60
    );

  const operationx = generalX;
  const operationy = generalY + 100;

  const start = new Date(vehicles[0]?.updatedAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const finish = new Date(vehicles.at(-1)?.updatedAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("2 - INFORMAÇÕES DE OPERAÇÃO", operationx, operationy, {
      align: "center",
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("INICIO OPERAÇÃO / DESCARGA:", operationx, operationy + 20);
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(start, operationx + 165, operationy + 20);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("FIM OPERAÇÃO / DESCARGA:", operationx, operationy + 40);
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(finish, operationx + 150, operationy + 40);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("QUANTIDADE DE VEÍCULOS:", operationx, operationy + 60);
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(`${vehicles.length} VEÍCULOS`, operationx + 145, operationy + 60);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("VEÍCULOS AVARIADOS:", operationx + 240, operationy + 60);
  const damagedCount = vehicles.filter((v) => v.nonconformities?.length).length;
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(`${damagedCount} VEÍCULOS`, operationx + 360, operationy + 60);

  const statsx = operationx;
  const statsy = operationy + 100;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("3 - ESTATÍSTICA DE DESCARREGAMENTO", statsx, statsy, {
      align: "center",
    });

  const groupMap = {};
  vehicles.forEach((v) => {
    const brand = v.brand || "N/A";
    const model = v.model || "N/A";
    const key = brand + "||" + model;
    if (!groupMap[key]) {
      groupMap[key] = { brand, model, total: 0, damaged: 0 };
    }
    groupMap[key].total += 1;
    if (Array.isArray(v.nonconformities) && v.nonconformities.length > 0) {
      groupMap[key].damaged += 1;
    }
  });

  const grouped = Object.values(groupMap).sort(
    (a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)
  );

  const rows = grouped.map((g) => [
    g.brand,
    g.model,
    String(g.total),
    String(g.damaged),
    g.total ? ((g.damaged / g.total) * 100).toFixed(2) + "%" : "0%",
  ]);

  // Se não houver dados, adiciona linha vazia informativa
  if (rows.length === 0) {
    rows.push(["-", "-", "0", "0", "0%"]);
  }

  doc.font("Helvetica-Bold").fontSize(8).text("");

  // INÍCIO TABELA CUSTOM (ajustada com novas larguras e altura dinâmica)
  const colWidths = [90, 190, 50, 80, 40]; // Marca, Modelo, Unidades, Total Avariados, %
  const baseRowHeight = 20;
  const cellPaddingY = 4;
  const headers = ["Marca", "Modelo", "Unidades", "Total Avariados", "%"];

  function ensurePageSpace(requiredHeight) {
    const usableBottom = doc.page.height - doc.page.margins.bottom;
    if (doc.y + requiredHeight > usableBottom) {
      doc.addPage();
    }
  }

  function measureRowHeight(cells, isHeader = false) {
    const font = isHeader ? "Helvetica-Bold" : "Helvetica";
    doc.font(font).fontSize(8);
    let maxH = baseRowHeight;
    cells.forEach((cell, i) => {
      const w = colWidths[i];
      const text = cell == null ? "" : String(cell);
      const h = doc.heightOfString(text, {
        width: w - 4, // pequena margem lateral
        align: "center",
      });
      const cellTotal = h + cellPaddingY * 2;
      if (cellTotal > maxH) maxH = cellTotal;
    });
    return Math.ceil(maxH);
  }

  function drawRow(cells, { header = false } = {}) {
    const startX = doc.page.margins.left;
    const y = doc.y;
    const rowHeight = measureRowHeight(cells, header);

    ensurePageSpace(rowHeight);

    // Bordas simples
    let x = startX;
    cells.forEach((_, i) => {
      const w = colWidths[i];
      doc.rect(x, y, w, rowHeight).strokeColor("black").lineWidth(0.5).stroke();
      x += w;
    });

    // Texto
    doc
      .font(header ? "Helvetica-Bold" : "Helvetica")
      .fontSize(8)
      .fillColor("#000");
    x = startX;
    cells.forEach((cell, i) => {
      const w = colWidths[i];
      const text = cell == null ? "" : String(cell);
      // Altura do bloco de texto dentro da largura
      const textHeight = doc.heightOfString(text, {
        width: w - 4,
        align: "center",
      });
      const textY = y + (rowHeight - textHeight) / 2;
      doc.text(text, x + 2, textY, {
        width: w - 4,
        align: "center",
      });
      x += w;
    });

    doc.y = y + rowHeight;
  }

  function drawTable(headersArr, dataRows) {
    // Cabeçalho
    const headerHeight = measureRowHeight(headersArr, true);
    ensurePageSpace(headerHeight);
    drawRow(headersArr, { header: true });

    // Linhas
    dataRows.forEach((r) => {
      drawRow(r);
    });
  }

  drawTable(headers, rows);

  // ========= NOVA SEÇÃO 4 - IMAGENS DOS VEÍCULOS AVARIADOS =========
  const damagedVehicles = vehicles.filter(
    (v) => Array.isArray(v.nonconformities) && v.nonconformities.length
  );

  if (damagedVehicles.length) {
    // Espaço antes da nova seção
    doc.moveDown(1.5);
    if (doc.y > doc.page.height - 150) doc.addPage();

    const sectionTitle = "4 - IMAGENS DOS VEÍCULOS AVARIADOS";
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(sectionTitle, doc.page.margins.left, doc.y, { align: "center" });
    doc.moveDown(0.5);

    // Cabeçalho da tabela de imagens
    const imageHeader = ["CHASSI", "VEÍCULO", "PEÇA AVARIADA", "AVARIA"];

    const columnWidth = 112.5; // 4 * 112.5 = 450
    const imageRowHeight = 100; // altura total da linha (imagem + legenda)
    const captionHeight = 16; // altura reservada para o texto abaixo
    const topPadding = 4;
    const gapBelowImage = 4;
    const imageMaxWidth = 90;
    const imageMaxHeight =
      imageRowHeight - captionHeight - topPadding - gapBelowImage; // espaço útil para imagem
    const startX = doc.page.margins.left;

    const drawImageHeader = () => {
      const y = doc.y;
      let x = startX;
      doc.font("Helvetica-Bold").fontSize(8);
      imageHeader.forEach((h) => {
        doc
          .rect(x, y, columnWidth, 20)
          .strokeColor("white")
          .lineWidth(0.5)
          .stroke();
        doc.text(h, x, y + 6, { width: columnWidth, align: "center" });
        x += columnWidth;
      });
      doc.y = y + 20;
    };

    const fetchImageBuffer = async (filename) => {
      if (!filename) return null;
      const baseURL = `${req.protocol}://${req.get("host")}`;
      const url = `${baseURL}/api/images/${encodeURIComponent(filename)}`;
      const useHttps = url.startsWith("https");
      const lib = useHttps ? require("https") : require("http");
      return new Promise((resolve) => {
        const r = lib.get(url, (resp) => {
          if (resp.statusCode !== 200) {
            resp.resume();
            return resolve(null);
          }
          const chunks = [];
          resp.on("data", (c) => chunks.push(c));
          resp.on("end", () => resolve(Buffer.concat(chunks)));
        });
        r.on("error", () => resolve(null));
      });
    };

    const optimizeImageBuffer = async (buffer) => {
      if (!buffer) return null;
      try {
        const targetPx = Math.round(imageMaxWidth * 2);
        return await sharp(buffer)
          .rotate()
          .resize({ width: targetPx, withoutEnlargement: true })
          .jpeg({ quality: 60, mozjpeg: true, chromaSubsampling: "4:2:0" })
          .toBuffer();
      } catch {
        return buffer;
      }
    };

    const ensureImageSpace = (needed) => {
      if (doc.y + needed > doc.page.height - 70) {
        doc.addPage();
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(sectionTitle, doc.page.margins.left, doc.y, {
            align: "center",
          });
        doc.moveDown(0.5);
        drawImageHeader();
      }
    };

    async function drawImageRow(imageFiles, captions) {
      ensureImageSpace(imageRowHeight);
      const rowY = doc.y;

      // Desenha contornos das 4 células
      for (let i = 0; i < 4; i++) {
        const x = startX + i * columnWidth;
        doc
          .rect(x, rowY, columnWidth, imageRowHeight)
          .strokeColor("white")
          .lineWidth(0.5)
          .stroke();
      }

      // Carrega e otimiza
      const buffers = await Promise.all(
        imageFiles.map((f) => (f ? fetchImageBuffer(f) : Promise.resolve(null)))
      );
      const processed = await Promise.all(
        buffers.map((b) => (b ? optimizeImageBuffer(b) : Promise.resolve(null)))
      );

      // Desenha imagens (centralizadas na área superior reservada)
      processed.forEach((buffer, i) => {
        if (!buffer) return;
        const cellX = startX + i * columnWidth;
        try {
          // Medida tentativa para manter proporção aproximada (assume altura 3:4 se não souber)
          // Primeiro desenhamos com width controlado
          doc.image(
            buffer,
            cellX + (columnWidth - imageMaxWidth) / 2,
            rowY + topPadding,
            {
              width: imageMaxWidth,
              height: imageMaxHeight,
              align: "center",
              valign: "top",
            }
          );
        } catch (_) {}
      });

      // Legendas ao fundo (abaixo das imagens)
      doc.font("Helvetica").fontSize(7).fillColor("#000");
      const captionY = rowY + imageRowHeight - captionHeight + 2;
      captions.forEach((txt, i) => {
        const x = startX + i * columnWidth;
        doc.text(txt || "", x + 2, captionY, {
          width: columnWidth - 4,
          align: "center",
        });
      });

      doc.y = rowY + imageRowHeight;
    }

    drawImageHeader();

    for (const v of damagedVehicles) {
      const ncs = v.nonconformities || [];

      if (!ncs.length) {
        // Sem avarias listadas: mostra apenas chassi / modelo sem peças
        await drawImageRow(
          [
            v.etChassisImageFilename || null,
            v.profileImageFilename || null,
            null,
            null,
          ],
          [v.chassis || "", v.model || "", "", ""]
        );
        continue;
      }

      for (let i = 0; i < ncs.length; i++) {
        const nc = ncs[i];
        await drawImageRow(
          [
            i === 0 ? v.etChassisImageFilename || null : null,
            i === 0 ? v.profileImageFilename || null : null,
            nc.image1 || null,
            nc.image2 || null,
          ],
          [
            i === 0 ? v.chassis || "" : "",
            i === 0 ? v.model || "" : "",
            nc.vehicleParts || "",
            nc.nonconformityTypes || "",
          ]
        );
      }
    }
  } else {
    doc.moveDown(1);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("4 - IMAGENS DOS VEÍCULOS AVARIADOS", { align: "center" });
    doc.moveDown(0.5);
    doc
      .font("Helvetica")
      .fontSize(9)
      .text("Nenhum veículo avariado com imagens disponíveis.", {
        align: "center",
      });
  }

  doc.end();
  return new Promise((resolve) => doc.on("end", resolve));
}

module.exports = { generateVehiclesPDF };
