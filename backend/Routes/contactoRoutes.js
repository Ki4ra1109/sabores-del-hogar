const express = require("express");
const router = express.Router();
const {
  crearMensaje,
  listarMensajes,
  responderMensaje
} = require("../controllers/contactoController");

router.post("/", crearMensaje);
router.get("/", listarMensajes);
router.post("/responder", responderMensaje);

module.exports = router;
