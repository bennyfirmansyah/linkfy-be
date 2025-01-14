const fs = require('fs');
const path = require('path');
const { Users, Links } = require('../../models');

const hapusUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const cekAkun = await Users.findByPk(userId, {
            include: {
                model: Links,
                attributes: ['gambar']
            }
        });

        if (!cekAkun) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        if (cekAkun.role === 'admin') {
            return res.status(403).json({ 
                message: 'Akun dengan role admin tidak dapat dihapus' 
            });
        }

        if (cekAkun.Links.gambar) {
            const filePath = path.resolve(cekAkun.Links.gambar);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); 
            }
        }

        await cekAkun.destroy();

        res.status(200).json({ message: 'User berhasil dihapus' });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error });
    }
};

module.exports = { hapusUser };