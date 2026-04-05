const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const { authRouter } = require("./routes/auth");
const { catsRouter } = require("./routes/cats");
const { meetingsRouter } = require("./routes/meetings");
const { adminRouter, publicVenuesRouter } = require("./routes/admin");
const { transfersRouter } = require("./routes/transfers");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "purrmatch-backend" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/cats", catsRouter);
app.use("/api/v1/meetings", meetingsRouter);
app.use("/api/v1/venues", publicVenuesRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/transfers", transfersRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = { app };

