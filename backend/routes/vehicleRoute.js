const { Router } = require("express");

const {
  getVehicles,
  getNotDoneVehicles,
  getVehicle,
  postVehicle,
  putVehicle,
  deleteVehicle,
  getShipsTravels,
  vehiclesPDF,
  vehiclePDF,
} = require("../controllers/vehicleController");

const router = Router();

router.get("/ships-travels", getShipsTravels);
router.get("/pdf", vehiclesPDF);
router.get("/:id/pdf", vehiclePDF); // Mover esta rota antes da /:id
router.get("/", getVehicles);
router.get("/not-done", getNotDoneVehicles);
router.get("/:id", getVehicle);
router.post("/", postVehicle);
router.put("/:id", putVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
