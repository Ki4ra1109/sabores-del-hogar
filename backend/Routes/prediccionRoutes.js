// routes/prediccion.js
const router = require("express").Router();
const ctrl = require("../controllers/prediccionController");

// Serie mensual (para graficar histórico mensual)
router.get("/timeseries-mensual", ctrl.timeseriesMensual);

// Pronóstico próximos N meses (default 3): /api/prediccion/forecast?months=3
router.get("/forecast", ctrl.forecast);

module.exports = router;
