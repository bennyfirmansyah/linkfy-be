const fs = require('fs');
const path = require('path');
const { sequelize, Links} = require('../../models');

const hapusLink = async (req, res) => {
    const linkId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    try {
        const result = await sequelize.transaction(async (t) => {
            // Inisialisasi variabel untuk menyimpan data link
            let link;

            // Periksa role dan ambil data link berdasarkan kondisi
            if (role === 'admin') {
                link = await Links.findByPk(linkId, { transaction: t });
                if (!link) {
                    return res.status(404).json({
                        success: false,
                        message: 'Link tidak ditemukan'
                    });
                }
            } else if (role === 'user') {
                link = await Links.findOne({ 
                    where: { id: linkId, id_user: userId },
                    transaction: t 
                });
                if (!link || link.id_user !== userId) {
                    return res.status(404).json({ 
                        success: false,
                        message: 'Link tidak ditemukan atau Anda tidak memiliki akses' 
                    });
                }
            }

            // Hapus gambar jika ada
            if (link.gambar) {
                const filePath = path.resolve(link.gambar);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Hapus file gambar
                }
            }
            await link.destroy({ transaction: t });
            return link;
        });

        // Kirim respons sukses
        return res.status(200).json({
            success: true,
            message: 'Link berhasil dihapus'
        });

    } catch (error) {
        console.error('Error in hapusLink:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = { hapusLink };