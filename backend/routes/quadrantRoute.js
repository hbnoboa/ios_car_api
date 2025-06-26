const { Router } = require("express");
const {
  getQuadrants,
  getQuadrant,
  postQuadrant,
  putQuadrant,
  deleteQuadrant,
} = require("../controllers/quadrantController");

const router = Router();

router.get("/", getQuadrants);
router.get("/:id", getQuadrant);
router.post("/", postQuadrant);
router.put("/:id", putQuadrant);
router.delete("/:id", deleteQuadrant);

module.exports = router;
