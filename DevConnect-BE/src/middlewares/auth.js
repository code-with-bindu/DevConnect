const User = require("../models/user.js");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login! ");
    }
    const { _id } = jwt.verify(token, "DEV@CONNECT");
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User is not found!!!");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

module.exports = {
  userAuth,
};
