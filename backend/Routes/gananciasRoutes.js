const express = require("express");
const router = express.Router();
const { obtenerGanancias } = require("../controllers/gananciasController");

router.get("/", obtenerGanancias);

module.exports = router;
