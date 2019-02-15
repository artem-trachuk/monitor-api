const express = require("express");
const compression = require("compression");
const path = require("path");
const logger = require("morgan");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const apiRoutes = require("./api/routes");

mongoose
  .connect(
    "mongodb://localhost/monitor",
    { useNewUrlParser: true }
  )
  .then(c => {
    console.log("Connection to MongoDB was established.");
  });

const app = express();
app.use(compression());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120 // limit each IP to 120 requests per windowMs
});

//  apply to all requests
app.use(limiter);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res
      .status(200)
      .json({ ok: true, description: "Access-Control-Allow-Methods" });
  }
  next();
});

// API
app.use("/api/", apiRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  console.log(error.message);
  res.status(error.status || 500);
  res.json({
    ok: false,
    description: error.message || error.toString()
  });
});

module.exports = app;
