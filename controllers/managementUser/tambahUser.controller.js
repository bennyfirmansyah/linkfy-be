const bcrypt =require('bcrypt');
const { Users } = require('../../models');
const XLSX = require('xlsx')

const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-12);
};

// Validasi email
const validateEmail = (email) => {
    if (!email) {
        throw new Error('Email harus diisi');
    }
    if (!email.endsWith('@gmail.com')) {
        throw new Error('Email harus menggunakan domain @gmail.com');
    }
};

// Validasi user data
const validateUserData = (user) => {
    const { email, nama, role } = user;
    
    if (!nama || !role) {
        throw new Error('Data nama dan role harus diisi');
    }
    
    validateEmail(email);
};

const tambahUser = async (req, res) => {
    const { email, nama, unit, role } = req.body;
    
    try {
        // Validasi input
        if (!email || !nama || !role) {
            return res.status(400).json({ message: 'Semua field harus diisi' });
        }

        // Validasi email gmail
        if (!email.endsWith('@gmail.com')) {
            return res.status(400).json({ message: 'Email harus menggunakan domain @gmail.com' });
        }

        // Cek email exists
        const userExists = await Users.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const randomPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        await Users.create({
            email,
            nama,
            unit,
            role,
            password: hashedPassword
        });

        res.status(201).json({
            message: 'User berhasil ditambahkan'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

const tambahUserBulk = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File tidak ditemukan' });
        }

        // Proses file dari buffer memory
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ message: 'File Excel kosong' });
        }

        const results = {
            success: [],
            failed: []
        };

        // Proses setiap baris
        for (const row of data) {
            try {
                validateUserData(row);

                // Validasi khusus email gmail
                if (!row.email.endsWith('@gmail.com')) {
                    throw new Error(`Email ${row.email} harus menggunakan domain @gmail.com`);
                }

                const userExists = await Users.findOne({ 
                    where: { email: row.email } 
                });
                
                if (userExists) {
                    throw new Error(`Email ${row.email} sudah terdaftar`);
                }

                const randomPassword = generateRandomPassword();
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                await Users.create({
                    email: row.email,
                    nama: row.nama,
                    unit: row.unit,
                    role: row.role,
                    password: hashedPassword
                });

                results.success.push({
                    email: row.email,
                    password: randomPassword,
                    nama: row.nama,
                    unit: row.unit,
                    role: row.role
                });
            } catch (error) {
                results.failed.push({
                    data: row,
                    error: error.message
                });
            }
        }

        res.status(200).json({
            message: 'Proses import selesai',
            summary: {
                total: data.length,
                berhasil: results.success.length,
                gagal: results.failed.length
            },
            gagal: results.failed
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Gagal memproses file Excel',
            error: error.message
        });
    }
};

module.exports = {
    tambahUser,
    tambahUserBulk
};
