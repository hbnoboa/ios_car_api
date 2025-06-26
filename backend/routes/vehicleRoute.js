const { Router } = require("express");

const {
  getVehicles,
  getVehicle,
  postVehicle,
  putVehicle,
  deleteVehicle,
  getShipsTravels,
} = require("../controllers/vehicleController");

const router = Router();

router.get("/ships-travels", getShipsTravels);

router.get("/", getVehicles);
router.get("/:id", getVehicle);
router.post("/", postVehicle);
router.put("/:id", putVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
