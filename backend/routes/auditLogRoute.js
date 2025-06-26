const { Router } = require("express");
const requireRole = require("../middleware/role");
const AuditLog = require("../models/auditLogModel");
const router = Router();

router.get("/", requireRole("Admin", "Manager"), async (req, res) => {
  const logs = await AuditLog.find().sort({ date: -1 }).limit(1000);
  res.json(logs);
});

module.exports = router;
