const { Router } = require("express");
const {
  getNonconformities,
  getNonconformity,
  postNonconformity,
  putNonconformity,
  deleteNonconformity,
} = require("../controllers/nonconformityController");

const router = Router({ mergeParams: true });

router.get("/", getNonconformities);
router.get("/:id", getNonconformity);
router.post("/", postNonconformity);
router.put("/:id", putNonconformity);
router.delete("/:id", deleteNonconformity);

module.exports = router;
