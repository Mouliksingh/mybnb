// controllers/users.js
const User = require("../models/user");

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      return res.status(201).json({ message: "Registered and logged in successfully", user: registeredUser });
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

module.exports.login = async (req, res) => {
  return res.json({ message: "Logged in successfully", user: req.user });
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.json({ message: "Logged out successfully" });
  });
};

module.exports.getCurrentUser = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ user: null });
  }
  return res.json({ user: req.user });
};