const { Router } = require("express");

const {
  getVehicles,
  getNotDoneVehicles,
  getVehicle,
  postVehicle,
  putVehicle,
  deleteVehicle,
  getShipsTravels,
} = require("../controllers/vehicleController");

const router = Router();

router.get("/ships-travels", getShipsTravels);

router.get("/", getVehicles);
router.get("/not-done", getNotDoneVehicles);
router.get("/:id", getVehicle);
router.post("/", postVehicle);
router.put("/:id", putVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
