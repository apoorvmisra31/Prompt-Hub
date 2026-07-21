const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {registerController,loginController,getMeController,getLogoutController,deleteAccountController} = require('../controllers/auth.controller');

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/me', authMiddleware, getMeController);
router.get('/logout', getLogoutController);
router.get('/delete', authMiddleware, deleteAccountController);

module.exports = router;