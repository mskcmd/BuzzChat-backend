const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const userAuth = require('../middleware/authMiddleware');


router.post('/register',userController.registerUser)
router.post('/login',userController.loginUser)
router.get("/",userAuth.protect,userController.allUsers)


module.exports = router;
