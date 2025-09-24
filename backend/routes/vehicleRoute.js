const { Router } = require("express");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const {
  getVehicles,
  getNotDoneVehicles,
  getVehicle,
  postVehicle,
  importVehicles,
  putVehicle,
  deleteVehicle,
  getShipsTravels,
  vehiclesPDF,
  vehiclePDF,
} = require("../controllers/vehicleController");

const router = Router();

router.get("/ships-travels", getShipsTravels);
router.get("/pdf", vehiclesPDF);
router.get("/:id/pdf", vehiclePDF);
router.get("/", getVehicles);
router.get("/not-done", getNotDoneVehicles);
router.get("/:id", getVehicle);
router.post("/", postVehicle);
router.post("/import", upload.single("file"), importVehicles);
router.put("/:id", putVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
