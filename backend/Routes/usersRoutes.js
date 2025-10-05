const express = require("express");
const router = express.Router();

const {
  getUsuario,
  patchUsuario,
  updateMyPassword,
  getMe,
} = require("../controllers/usersController");

const { authJwt } = require("../middleware/authJwt");

// Perfil del usuario autenticado
router.get("/me", authJwt, getMe);

// Cambiar contraseña del propio usuario
router.patch("/me/password", authJwt, updateMyPassword);

// Obtener un usuario por id (sin auth si así lo desean; agrega authJwt si debe protegerse)
router.get("/:id", getUsuario);

// Actualizar parcialmente un usuario por id
router.patch("/:id", patchUsuario);

module.exports = router;
