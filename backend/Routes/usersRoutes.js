const express = require("express");
const router = express.Router();
const { getUsuario, patchUsuario, updateMyPassword, getMe } = require("../controllers/usersController");
const { authJwt } = require("../middleware/authJwt");

router.get("/me", authJwt, getMe);
router.patch("/me/password", authJwt, updateMyPassword);

router.get("/:id", getUsuario);
router.patch("/:id", patchUsuario);

module.exports = router;
