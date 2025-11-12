const express = require("express");
const router = express.Router();
const productoCtrl = require("../controllers/productoController");

// =======================================================
// 🛍️ RUTA PÚBLICA (catálogo)
// =======================================================
router.get("/catalogo", productoCtrl.obtenerProductosActivos);

// =======================================================
// 🧱 CRUD ADMIN
// =======================================================
router.get("/", productoCtrl.obtenerProductos);
router.post("/", productoCtrl.crearProducto);
router.put("/:id", productoCtrl.actualizarProducto);
router.delete("/:id", productoCtrl.eliminarProducto);

// =======================================================
// 🖼️ SUBIDA DE IMÁGENES
// =======================================================
router.post("/upload", productoCtrl.subirImagen);

// =======================================================
// 🎯 PRODUCTO POR SKU (para página de detalle)
// =======================================================
router.get("/:sku", productoCtrl.obtenerProductoPorSku);

module.exports = router;
