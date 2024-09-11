
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { sendMessage ,allMessagess } = require("../controller/messageController");
const router = express.Router();

router.route("").post(protect,sendMessage);
router.route("/:chatId").get(protect,allMessagess);

module.exports = router;
