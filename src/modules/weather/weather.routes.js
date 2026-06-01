const express = require("express");

const router = express.Router();

const weatherController = require(
  "./weather.controller"
);

router.get(
  "/",
  weatherController.getWeather
);

module.exports = router;