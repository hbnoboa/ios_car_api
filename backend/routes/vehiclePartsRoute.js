const { Router } = require("express");

const {
  getVehicleParts,
  getVehiclePart,
  postVehiclePart,
  putVehiclePart,
  deleteVehiclePart,
} = require("../controllers/vehiclePartController");

const router = Router();

router.get("/", getVehicleParts);
router.get("/:id", getVehiclePart);
router.post("/", postVehiclePart);
router.put("/:id", putVehiclePart);
router.delete("/:id", deleteVehiclePart);

module.exports = router;
