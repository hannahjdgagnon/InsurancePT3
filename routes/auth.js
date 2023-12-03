// auth.js
const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login", authController.displayLoginPage);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  authController.processLoginPage
);

router.get("/register", authController.displayRegisterPage);
router.post("/register", authController.processRegisterPage);

router.get("/logout", authController.performLogout);

module.exports = router;
