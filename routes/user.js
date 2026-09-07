// routes/user.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/users");

router.post("/signup", userController.signup);

router.post(
  "/login",
  passport.authenticate("local"),
  userController.login
);

router.post("/logout", userController.logout);

router.get("/me", userController.getCurrentUser);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login` }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  }
);

module.exports = router;