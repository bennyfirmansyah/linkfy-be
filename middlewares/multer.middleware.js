const multer = require("multer");
const path = require('path');

// Storage untuk upload gambar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Konfigurasi untuk upload gambar
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF files are allowed.'));
        }
    }
});

// Konfigurasi untuk upload Excel (menggunakan memory storage)
const uploadExcel = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // xlsx
            file.mimetype === 'application/vnd.ms-excel' // xls
        ) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file Excel yang diperbolehkan (.xlsx atau .xls)'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit 5MB
    }
});

module.exports = {
    upload,         // untuk upload gambar
    uploadExcel     // untuk upload excel
};