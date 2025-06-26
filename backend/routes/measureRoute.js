const { Router } = require("express");
const {
  getMeasures,
  getMeasure,
  postMeasure,
  putMeasure,
  deleteMeasure,
} = require("../controllers/measureController");

const router = Router();

router.get("/", getMeasures);
router.get("/:id", getMeasure);
router.post("/", postMeasure);
router.put("/:id", putMeasure);
router.delete("/:id", deleteMeasure);

module.exports = router;
