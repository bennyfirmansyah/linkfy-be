const { Users } = require('../../models');
const { Op } = require('sequelize');

const cariUser = async (req, res) => {
    try {
        const { q: searchQuery } = req.query;

        if (!searchQuery) {
            return res.status(400).json({ message: 'Query tidak valid' });
        }

        const keywords = searchQuery.split(' ').filter(Boolean);

        const searchConditions = keywords.map((keyword) => ({
            [Op.or]: [
                { nama: { [Op.iLike]: `%${keyword}%` } }, 
                { email: { [Op.iLike]: `%${keyword}%` } }   
            ]
        }));

        const users = await Users.findAll({
            where: {
                [Op.and]: searchConditions
            }
        });

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        return res.status(200).json({
            data: users,
        });

    } catch (error) {
        console.error('Error saat mencari user:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
};

module.exports = { cariUser };