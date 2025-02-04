var express = require('express');
var router = express.Router();
var { auth } = require('../middlewares/auth.middleware');
var { login, getGoogleURL, googleCallback } = require('../controllers/auth/login.controller');
var { refreshAccessToken } = require('../controllers/auth/refreshAccessToken.controller');
var { logout } = require('../controllers/auth/logout.controller');
var { gantiPassword } = require('../controllers/auth/gantiPassword.controller');

router.post('/login', login);
router.get('/google', getGoogleURL);
router.get('/google/callback', googleCallback);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', auth(['admin','user', 'umum']), logout);
router.put('/change-password', auth(['admin','user','umum']), gantiPassword);

module.exports = router;
