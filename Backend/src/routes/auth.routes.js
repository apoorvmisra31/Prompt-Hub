const express = require('express');
const router = express.Router();
const {registerController,loginController,getLogoutController,deleteAccountController} = require('../controllers/auth.controller');

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/logout', getLogoutController);
router.get('/delete', deleteAccountController);

module.exports = router;