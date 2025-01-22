var express = require('express');
var router = express.Router();
var { auth } = require('../middlewares/auth.middleware');
var { login, getGoogleURL, googleCallback } = require('../controllers/auth/login.controller');
var { refreshAccessToken } = require('../controllers/auth/refreshAccessToken.controller');
var { logout } = require('../controllers/auth/logout.controller');

router.post('/login', login);
router.get('/google', getGoogleURL);
router.get('/google/callback', googleCallback);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', auth(['admin','user']), logout);

module.exports = router;
