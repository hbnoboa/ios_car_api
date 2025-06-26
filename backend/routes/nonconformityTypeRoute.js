const { Router } = require("express");
const {
  getNonconformityTypes,
  getNonconformityType,
  postNonconformityType,
  putNonconformityType,
  deleteNonconformityType,
} = require("../controllers/nonconformityTypeController");

const router = Router();

router.get("/", getNonconformityTypes);
router.get("/:id", getNonconformityType);
router.post("/", postNonconformityType);
router.put("/:id", putNonconformityType);
router.delete("/:id", deleteNonconformityType);

module.exports = router;
