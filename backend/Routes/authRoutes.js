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

router.post("/login", login);

// registro normal
router.post("/register", registerUser);
router.post("/google", googleLogin);
router.post("/google-token", googleLoginToken);
router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);

module.exports = router;
