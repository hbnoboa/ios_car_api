const { Router } = require("express");
const {
  getNonconformityLocals,
  getNonconformityLocal,
  postNonconformityLocal,
  putNonconformityLocal,
  deleteNonconformityLocal,
} = require("../controllers/nonconformityLocalController");

const router = Router();

router.get("/", getNonconformityLocals);
router.get("/:id", getNonconformityLocal);
router.post("/", postNonconformityLocal);
router.put("/:id", putNonconformityLocal);
router.delete("/:id", deleteNonconformityLocal);

module.exports = router;
