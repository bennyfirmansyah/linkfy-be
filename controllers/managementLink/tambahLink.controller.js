const fs = require('fs');
const path = require('path');
const { sequelize } = require('../../models');
const { Users, Links, ShareLink } = require('../../models');
const textVectorizer = require('../../utils/textVectorizer.utils');

const tambahLink = async (req, res) => {
    const userId = req.user.id;
    const { judul, url, deskripsi, visibilitas, sharedWith = [] } = req.body;
    console.log(req.body);
    try {
        // Validasi input
        if (!judul?.trim() || !url?.trim()) {
            return res.status(400).json({ 
                success: false,
                error: 'Judul dan URL harus diisi' 
            });
        }

        // Cek URL duplikat
        const linkExists = await Links.findOne({ where: { url } });
        if (linkExists) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ 
                success: false,
                message: 'Link sudah ada' 
            });
        }

        // Handle upload gambar
        let gambar = null;
        if (req.file) {
            const allowedMimeTypes = ['image/jpeg', 'image/png'];
            const directory = `uploads/${userId}/`;
            
            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Format gambar tidak didukung' 
                });
            }

            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            const targetPath = path.join(directory, req.file.filename);
            fs.renameSync(req.file.path, targetPath);
            gambar = targetPath;
        }

        const vectorData = textVectorizer.generateVector(judul, deskripsi);      
        // Extract keywords sebagai kandidat tags
        const keywordScores = Object.entries(vectorData.vector)
            .sort(([,a], [,b]) => b - a)
            .map(([term]) => term);

        const result = await sequelize.transaction(async (t) => {
                // Create link
            const link = await Links.create({
                id_user: userId,
                judul,
                url,
                deskripsi,
                gambar,
                visibilitas,
                vector: vectorData.vector,
                vector_metadata: vectorData.metadata
            }, { transaction: t });

            if (visibilitas === 'private' && sharedWith.length > 0) {
                // Validate shared users exist
                const users = await Users.findAll({
                    where: { id: sharedWith },
                    attributes: ['id'],
                    transaction: t
                });

                const validUserIds = users.map(user => user.id);

                // Create share records
                await ShareLink.bulkCreate(
                    validUserIds.map(shareUserId => ({
                        id_user: shareUserId,
                        id_link: link.id
                    })),
                    { transaction: t }
                );
            }
        });

    return res.status(201).json({
        success: true,
        message: 'Link berhasil ditambahkan',
    });
        
    } catch (error) {
        console.error('Error in tambahLink:', error);
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }
        }
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

module.exports = { tambahLink };