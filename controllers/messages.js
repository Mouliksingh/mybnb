const Message = require("../models/message");

module.exports.index = async (req, res) => {
  try {
    const messages = await Message.find({ 
      $or: [{ sender: req.user._id }, { receiver: req.user._id }] 
    })
      .populate("sender receiver listing")
      .sort({ createdAt: -1 });
    res.render("messages/index.ejs", { messages });
  } catch (err) {
    res.render("messages/index.ejs", { messages: [] });
  }
};

module.exports.renderChat = async (req, res) => {
  res.render("messages/chat.ejs");
};

module.exports.sendMessage = async (req, res) => {
  req.flash("success", "Message sent successfully!");
  res.redirect("back");
};