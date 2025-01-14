var express = require('express');
var router = express.Router();
var { auth } = require('../middlewares/auth.middleware');
var { upload } = require('../middlewares/multer.middleware');

//Modul management user
var { cariUser } = require('../controllers/managementUser/cariUser.controller');
var { tambahUser } = require('../controllers/managementUser/tambahUser.controller');
var { hapusUser } = require('../controllers/managementUser/hapusUser.controller');
var { listUser } = require('../controllers/managementUser/listUser.controller');

router.get('/list-user', auth(['admin']), listUser);
router.post('/add-user', auth(['admin']), tambahUser);
router.get('/search-user', auth(['admin']), cariUser);
router.delete('/delete-user/:userId', auth(['admin']), hapusUser);

//modul management link
var { listLink } = require('../controllers/managementLink/listLink.controller');
var { tambahLink } = require('../controllers/managementLink/tambahLink.controller');
var { hapusLink } = require('../controllers/managementLink/hapusLink.controller');
var { editLink } = require('../controllers/managementLink/editLink.controller');

router.get('/list-link', auth(['admin', 'user']), listLink);
router.post('/add-link', auth(['admin', 'user']), upload.single('gambar'), tambahLink);
router.delete('/delete-link/:id', auth(['admin', 'user']), hapusLink);
router.put('/edit-link/:linkId', auth(['admin', 'user']), upload.single('gambar'), editLink);

//modul pencarian link
var { cariLink } = require('../controllers/pencarianLink/cariLink.controller');

router.get('/search-link', auth(['admin', 'user']), cariLink);


module.exports = router;
