const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

require("dotenv").config();

const measureRoute = require("./routes/measureRoute");
const quadrantRoute = require("./routes/quadrantRoute");
const vehicleRoute = require("./routes/vehicleRoute");
const vehiclePartsRoute = require("./routes/vehiclePartsRoute");
const nonconformityRoute = require("./routes/nonconformityRoute");
const nonconformityLevelRoute = require("./routes/nonconformityLevelRoute");
const nonconformityTypeRoute = require("./routes/nonconformityTypeRoute");
const nonconformityLocalRoute = require("./routes/nonconformityLocalRoute");
const imageRoute = require("./routes/imageRoute");
const authRoute = require("./routes/authRoute");
const auditLogRoute = require("./routes/auditLogRoute");
const auth = require("./middleware/auth");
const auditLog = require("./middleware/auditLog");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(cors());

app.set("io", io);

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

app.use("/api/images", imageRoute);
app.use("/api/auth", authRoute);
app.use("/api/audit-logs", auth, auditLogRoute);

app.use("/api/vehicles", auth, auditLog, vehicleRoute);
app.use("/api/vehicleparts", auth, auditLog, vehiclePartsRoute);
app.use(
  "/api/vehicles/:vehicleId/nonconformities",
  auth,
  auditLog,
  nonconformityRoute
);
app.use("/api/nonconformitylevels", auth, auditLog, nonconformityLevelRoute);
app.use("/api/nonconformitytypes", auth, auditLog, nonconformityTypeRoute);
app.use("/api/nonconformitylocals", auth, auditLog, nonconformityLocalRoute);
app.use("/api/measures", auth, auditLog, measureRoute);
app.use("/api/quadrants", auth, auditLog, quadrantRoute);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});
