var express = require('express');
var router = express.Router();
var { auth, optionalAuth } = require('../middlewares/auth.middleware');
var { upload, uploadExcel } = require('../middlewares/multer.middleware');

//Modul management user
var { tambahUser, tambahUserBulk } = require('../controllers/managementUser/tambahUser.controller');
var { hapusUser } = require('../controllers/managementUser/hapusUser.controller');
var { listUser } = require('../controllers/managementUser/listUser.controller');
var { editUser } = require('../controllers/managementUser/editUser.controller');

router.get('/list-user', auth(['admin']), listUser);
router.post('/add-user', auth(['admin']), tambahUser);
router.post('/add-user-bulk', auth(['admin']), uploadExcel.single('file'),tambahUserBulk);
router.delete('/delete-user/:userId', auth(['admin']), hapusUser);
router.put('/edit-user/:userId', auth(['admin']), editUser);

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
var { riwayatKueri, hapusRiwayatKueri } = require('../controllers/pencarianLink/riwayatKueri.controller');

router.get('/search-link', optionalAuth, cariLink);
router.post('/click-link', optionalAuth, klikLink); 
router.get('/explore-link', optionalAuth, eksploreLink);
router.get('/query-history', optionalAuth, riwayatKueri);
router.delete('/delete-query-history', optionalAuth, hapusRiwayatKueri);

//modul riwayat link
var { terakhirDikunjungi } = require('../controllers/riwayatLink/terakhirDikunjungi.controller');
var { seringDikunjungi } = require('../controllers/riwayatLink/seringDikunjungi.controller');

router.get('/last-visited', optionalAuth, terakhirDikunjungi);
router.get('/most-visited', optionalAuth, seringDikunjungi);

//modul feedback
var { tambahFeedback } = require('../controllers/feedback/tambahFeedback.controller');

router.post('/add-feedback', optionalAuth, tambahFeedback);

//modul dashboard
var { countLink } = require('../controllers/dashboard/countLink.controller');
var { countUserLogin } = require('../controllers/dashboard/countUserLogin.controller');
var { getTodayStats, getHourlyStats, getRealTimeSummary, getDailyStats } = require('../controllers/dashboard/countAccessLogs.controller');
var { hourlyLink, dailyLink } = require('../controllers/dashboard/countTraficLink.controller');
var { topLink, topLinkDaily } = require('../controllers/dashboard/countRiwayatLink.controller');

router.get('/count-link', auth(['admin']), countLink);
router.get('/count-user-login', auth(['admin']), countUserLogin);
router.get('/hourly', auth(['admin']), getHourlyStats);
router.get('/daily', auth(['admin']), getTodayStats);
router.get('/summary', auth(['admin']), getRealTimeSummary);
router.get('/daily-stats', auth(['admin']), getDailyStats);
router.get('/hourly-link', auth(['admin']), hourlyLink);
router.get('/daily-link', auth(['admin']), dailyLink);
router.get('/top-link', auth(['admin']), topLink);
router.get('/top-link-daily', auth(['admin']), topLinkDaily);


module.exports = router;
