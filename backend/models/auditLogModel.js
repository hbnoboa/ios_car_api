const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: String, // email ou id do usuário
  action: String, // "POST", "PUT", "DELETE"
  route: String, // rota acessada
  field: String, // id ou campo afetado
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  date: { type: Date, default: Date.now },
  ip: String,
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
