const { Router } = require("express");
const {
  signup,
  signin,
  confirm,
  forgotPassword,
  resetPassword,
  updateEmail,
  me,
  getUsers,
  postUsers,
  deleteUsers,
} = require("../controllers/authController");
const requireRole = require("../middleware/role");
const auth = require("../middleware/auth");

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/confirm/:token", confirm);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/update-email", auth, updateEmail);
router.get("/me", auth, me);

router.get("/", auth, requireRole("Admin", "Manager"), getUsers);
router.post("/", auth, requireRole("Admin", "Manager"), postUsers);
router.delete("/:id", auth, requireRole("Admin", "Manager"), deleteUsers);

module.exports = router;
