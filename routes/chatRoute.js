const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  creteteGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controller/chatControoler");

router.route("").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, creteteGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/groupremove").put(protect, removeFromGroup);

module.exports = router;
