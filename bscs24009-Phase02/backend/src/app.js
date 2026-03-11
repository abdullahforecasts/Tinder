const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const { authRouter } = require("./routes/auth");
const { catsRouter } = require("./routes/cats");
const { meetingsRouter } = require("./routes/meetings");
const { adminRouter } = require("./routes/admin");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "purrmatch-backend" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/cats", catsRouter);
app.use("/api/v1/meetings", meetingsRouter);
app.use("/api/v1/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = { app };

