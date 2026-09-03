const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messages.js");
const { isLoggedIn } = require("../middleware.js");

router.route("/")
  .get(isLoggedIn, messageController.index)
  .post(isLoggedIn, messageController.sendMessage);

router.get("/chat", isLoggedIn, messageController.renderChat);

module.exports = router;