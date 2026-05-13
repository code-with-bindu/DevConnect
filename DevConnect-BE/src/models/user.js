const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 18,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Invalid Password " + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        const allowedGenders = ["male", "female"];
        if (!allowedGenders.includes(value)) {
          throw new Error("Invalid Gender");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://tse3.mm.bing.net/th/id/OIP.w0TcjC4y9CxTrY3sitYa_AAAAA?pid=Api&P=0&h=180",
      validate(value) {
        if (typeof value === "string" && value.startsWith("data:image/")) { return; }
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL " + value);
        }
      },
    },
    about: {
      type: String,
      default: "This is a default about of the user",
      maxLength: 250,
    },
    skills: {
      type: [String],
      maxLength: 15,
    },
    openToCollab: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "DEV@CONNECT", {
    expiresIn: "7 days",
  });
  return token;
};

userSchema.methods.validatePassword = async function (password) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(password, passwordHash);
  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
