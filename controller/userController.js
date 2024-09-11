const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);

    const { name, email, password, imageUrl } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all fields");
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      imageUrl,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Failed to create user");
    }
  } catch (error) {
    console.log(error);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Not yet");
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.log(error);
  }
});

const allUsers = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword)
    // .find({ _id: { $ne: req.user._id } });
    res.send(users)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});



module.exports = { registerUser, loginUser , allUsers};
