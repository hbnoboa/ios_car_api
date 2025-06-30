const express = require("express");
const router = express.Router();
const {
  getNonconformities,
  getNonconformity,
  postNonconformity,
  putNonconformity,
  deleteNonconformity,
} = require("../controllers/nonconformityController");

// ERRADO (não faça isso!)
// router.get("/api/vehicles/:vehicleId/nonconformities", ...);

// CERTO (apenas o sufixo, pois o prefixo já está no app.use)
router.get("/", getNonconformities);
router.get("/:id", getNonconformity);
router.post("/", postNonconformity);
router.put("/:id", putNonconformity);
router.delete("/:id", deleteNonconformity);

module.exports = router;
