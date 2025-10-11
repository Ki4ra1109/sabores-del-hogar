const express = require("express");
const passport = require("passport");
const router = express.Router();
const {
  login,
  registerUser,
  googleCallback,
  googleLoginToken,
  forgotPassword,
  resetPassword,
  googleComplete, 
} = require("../controllers/authController");

router.post("/login", login);
router.post("/register", registerUser);
router.post("/google-token", googleLoginToken);
router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);
router.post("/google/complete", googleComplete);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=true`,
    session: false,
  }),
  googleCallback
);

module.exports = router;