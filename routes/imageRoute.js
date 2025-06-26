const express = require("express");
const multer = require("multer");
const { MongoClient, GridFSBucket } = require("mongodb");

const router = express.Router();
const upload = multer(); // armazena em memória

// Conexão com o MongoDB
const mongoUri = process.env.MONGODB_URI;
let bucket;

MongoClient.connect(mongoUri)
  .then((client) => {
    const db = client.db(); // usa o banco da URI
    bucket = new GridFSBucket(db, { bucketName: "uploads" });
    console.log("GridFS pronto!");
  })
  .catch((err) => {
    console.error("Erro ao conectar no MongoDB:", err);
  });

// Upload de imagem
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Arquivo não enviado" });
    const filename = Date.now() + "-" + req.file.originalname;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
    });
    uploadStream.end(req.file.buffer);
    uploadStream.on("finish", (file) => {
      res.json({ filename: file.filename, id: file._id });
    });
    uploadStream.on("error", (err) => {
      res.status(500).json({ error: "Erro ao salvar arquivo" });
    });
  } catch (err) {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.put("/edit/:oldFilename", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Arquivo não enviado" });

    // Remove a imagem antiga, se existir
    const files = await bucket
      .find({ filename: req.params.oldFilename })
      .toArray();
    if (files.length > 0) {
      await bucket.delete(files[0]._id);
    }

    // Faz upload da nova imagem
    const filename = Date.now() + "-" + req.file.originalname;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
    });
    uploadStream.end(req.file.buffer);
    uploadStream.on("finish", (file) => {
      res.json({ filename: file.filename, id: file._id });
    });
    uploadStream.on("error", (err) => {
      res.status(500).json({ error: "Erro ao salvar arquivo" });
    });
  } catch (err) {
    res.status(500).json({ error: "Erro interno" });
  }
});

// Download de imagem
router.get("/:filename", async (req, res) => {
  try {
    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
    downloadStream.on("file", (file) => {
      res.set("Content-Type", file.contentType || "application/octet-stream");
    });
    downloadStream.on("error", () => {
      res.status(404).json({ error: "Arquivo não encontrado" });
    });
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;
