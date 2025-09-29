const express = require("express");
const router = express.Router();
const { verCarrito } = require("../controllers/carritoController");

router.get("/carrito", verCarrito);

module.exports = router;
