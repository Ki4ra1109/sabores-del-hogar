const express = require("express");
const router = express.Router();
const {
  login,
  registerUser,
  googleLogin,
  googleLoginToken,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// login normal
router.post("/login", login);

// registro normal
router.post("/register", registerUser);

// Google (auth code)
router.post("/google", googleLogin);

// Google (access_token directo)
router.post("/google-token", googleLoginToken);

// recuperación de contraseña
router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);

module.exports = router;
