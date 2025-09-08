const express = require("express");
const router = express.Router();
const { getUsuario, patchUsuario } = require("../controllers/usersController");

// Perfil propio 
router.get("/:id", getUsuario);
router.patch("/:id", patchUsuario);

module.exports = router;
