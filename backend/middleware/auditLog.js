const AuditLog = require("../models/auditLogModel");

module.exports = async (req, res, next) => {
  if (!["POST", "PUT", "DELETE"].includes(req.method)) return next();

  // Salva referência do método original
  const originalSend = res.send;

  res.send = async function (body) {
    try {
      const user = req.user?.email || "desconhecido";
      const ip = req.ip;
      let oldValue = null;
      let newValue = null;
      let field = req.params.id || req.params.key || req.originalUrl;

      // Tente buscar o valor antigo para PUT/DELETE (opcional, pode customizar por rota/model)
      if (req.method === "PUT" || req.method === "DELETE") {
        // Exemplo para MongoDB: tente buscar o documento antigo se possível
        // (Requer saber o model, pode customizar por rota)
      }
      if (req.method === "POST" || req.method === "PUT") {
        newValue = req.body;
      }

      await AuditLog.create({
        user,
        action: req.method,
        route: req.originalUrl,
        field,
        oldValue,
        newValue,
        date: new Date(),
        ip,
      });
    } catch (err) {
      console.error("Erro ao salvar audit log:", err);
    }
    return originalSend.apply(this, arguments);
  };

  next();
};
