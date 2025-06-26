const { Router } = require("express");
const {
  getNonconformityLevels,
  getNonconformityLevel,
  postNonconformityLevel,
  putNonconformityLevel,
  deleteNonconformityLevel,
} = require("../controllers/nonconformityLevelController");

const router = Router();

router.get("/", getNonconformityLevels);
router.get("/:id", getNonconformityLevel);
router.post("/", postNonconformityLevel);
router.put("/:id", putNonconformityLevel);
router.delete("/:id", deleteNonconformityLevel);

module.exports = router;
