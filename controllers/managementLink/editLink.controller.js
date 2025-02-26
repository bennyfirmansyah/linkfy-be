const fs = require('fs');
const path = require('path');
const { sequelize } = require('../../models');
const { Users, Links, ShareLink } = require('../../models');
const textVectorizer = require('../../utils/textVectorizer.utils');

const editLink = async (req, res) => {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin'; // Assume role is included in user object
    const {linkId} = req.params;
    const { judul, url, deskripsi, visibilitas, kategori, sharedWith = [] } = req.body;
    
    try {
        // Validasi input
        if (!judul?.trim() || !url?.trim() || !kategori.trim()) {
            return res.status(400).json({ 
                success: false,
                error: 'Judul, URL, dan Kategori harus diisi' 
            });
        }

        // Cari link yang akan diedit
        const link = await Links.findByPk(linkId);
        if (!link) {
            return res.status(404).json({ 
                success: false,
                message: 'Link tidak ditemukan' 
            });
        }

        // Cek akses pengeditan
        // Admin dapat mengedit semua link, user hanya bisa edit link miliknya
        if (!isAdmin && link.id_user !== userId) {
            return res.status(403).json({ 
                success: false,
                message: 'Anda tidak memiliki akses untuk mengedit link ini' 
            });
        }

        // Cek URL duplikat (kecuali jika URL tidak diubah)
        if (url !== link.url) {
            const linkExists = await Links.findOne({ where: { url } });
            if (linkExists) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({ 
                    success: false,
                    message: 'URL sudah digunakan oleh link lain' 
                });
            }
        }

        // Handle upload gambar
        let gambar = link.gambar;
        if (req.file) {
            const allowedMimeTypes = ['image/jpeg', 'image/png'];
            const directory = `uploads/${link.id_user}/`; // Use original owner's ID for directory

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

            // Hapus gambar lama jika ada
            if (gambar && fs.existsSync(gambar)) {
                fs.unlinkSync(gambar);
            }

            gambar = targetPath;
        }

        const vectorData = textVectorizer.generateVector(judul, deskripsi);

        await sequelize.transaction(async (t) => {
            // Update link
            await link.update({
                judul,
                url,
                deskripsi,
                gambar,
                visibilitas,
                kategori,
                vector: vectorData.vector,
                vector_metadata: vectorData.metadata
            }, { transaction: t });

            if (visibilitas === 'public') {
                await ShareLink.destroy({
                    where: { id_link: linkId },
                    transaction: t
                });
            }

            if (visibilitas === 'private') {
                // Hapus share records lama
                await ShareLink.destroy({
                    where: { id_link: linkId },
                    transaction: t
                });

                if (sharedWith.length > 0) {
                    // Validate shared users exist
                    const users = await Users.findAll({
                        where: { id: sharedWith },
                        attributes: ['id'],
                        transaction: t
                    });

                    const validUserIds = users.map(user => user.id);

                    // Create new share records
                    await ShareLink.bulkCreate(
                        validUserIds.map(shareUserId => ({
                            id_user: shareUserId,
                            id_link: linkId
                        })),
                        { transaction: t }
                    );
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Link berhasil diperbarui'
        });

    } catch (error) {
        console.error('Error in editLink:', error);
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

module.exports = { editLink };