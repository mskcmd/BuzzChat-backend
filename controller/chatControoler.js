const asyncHandler = require("express-async-handler");
const Chat = require("../model/chatModel");
const generateToken = require("../config/generateToken");
const User = require("../model/userModel");

const accessChat = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }

    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name email imageUrl",
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      try {
        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id })
          .populate("users", "-password")
          .populate("latestMessage");

        res.status(200).send(fullChat);
      } catch (error) {
        console.log(error);
        res.status(400).send("Failed to create the chat");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email imageUrl",
    });

    res.status(200).send(chats);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to fetch chats" });
  }
});

const creteteGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Plese Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res
      .status(400)
      .send("More Then 2 users are required to from a group chat");
  }
  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).send(fullGroupChat);
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res
        .status(400)
        .json({ message: "Chat not found or could not be updated" });
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while renaming the group" });
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(400).json({ message: "Chat not found or could not add user" });
    } else {
      res.json(added);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while adding the user to the group",
    });
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  console.log(chatId, userId);

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res
        .status(400)
        .json({ message: "Chat not found or could not remove user" });
    } else {
      res.json(removed);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while removing the user from the group",
    });
  }
});

module.exports = {
  accessChat,
  fetchChats,
  creteteGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
