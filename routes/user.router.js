var express = require('express');
var router = express.Router();
var { auth } = require('../middlewares/auth.middleware');
var { upload } = require('../middlewares/multer.middleware');

//Modul management user
var { tambahUser } = require('../controllers/managementUser/tambahUser.controller');
var { hapusUser } = require('../controllers/managementUser/hapusUser.controller');
var { listUser } = require('../controllers/managementUser/listUser.controller');

router.get('/list-user', auth(['admin']), listUser);
router.post('/add-user', auth(['admin']), tambahUser);
router.delete('/delete-user/:userId', auth(['admin']), hapusUser);

//modul management link
var { listLink } = require('../controllers/managementLink/listLink.controller');
var { tambahLink } = require('../controllers/managementLink/tambahLink.controller');
var { hapusLink } = require('../controllers/managementLink/hapusLink.controller');
var { editLink } = require('../controllers/managementLink/editLink.controller');
var { allUser } = require('../controllers/managementLink/allUser.controller');

router.get('/list-link', auth(['admin', 'user']), listLink);
router.post('/add-link', auth(['admin', 'user']), upload.single('gambar'), tambahLink);
router.delete('/delete-link/:id', auth(['admin', 'user']), hapusLink);
router.put('/edit-link/:linkId', auth(['admin', 'user']), upload.single('gambar'), editLink);
router.get('/all-user', auth(['admin', 'user']), allUser);

//modul pencarian link
var { cariLink } = require('../controllers/pencarianLink/cariLink.controller');
var { klikLink } = require('../controllers/pencarianLink/klikLink.controller');
var { eksploreLink } = require('../controllers/pencarianLink/eksploreLink.controller');
var { riwayatKueri } = require('../controllers/pencarianLink/riwayatKueri.controller');

router.get('/search-link', auth(['admin', 'user']), cariLink);
router.post('/click-link', auth(['admin', 'user']), klikLink);
router.get('/explore-link', auth(['admin', 'user']), eksploreLink);
router.get('/query-history', auth(['admin', 'user']), riwayatKueri);

//modul riwayat link
var { terakhirDikunjungi } = require('../controllers/riwayatLink/terakhirDikunjungi.controller');
var { seringDikunjungi } = require('../controllers/riwayatLink/seringDikunjungi.controller');

router.get('/last-visited', auth(['admin', 'user']), terakhirDikunjungi);
router.get('/most-visited', auth(['admin', 'user']), seringDikunjungi);



module.exports = router;
