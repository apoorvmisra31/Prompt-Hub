const express = require('express');
const authMiddleware = require("../middleware/auth.middleware")
const chatController = require("../controllers/chat.controller")
const router = express.Router();

router.post('/', authMiddleware, chatController.createChat)
router.get('/', authMiddleware, chatController.getChats)
router.get('/messages/:id', authMiddleware, chatController.getMessages)

module.exports = router;