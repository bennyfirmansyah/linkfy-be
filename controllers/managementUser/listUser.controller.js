const { Users } = require('../../models');

const listUser = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const { count, rows: users } = await Users.findAndCountAll({
            attributes: { exclude: ['password'] },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']] 
        });

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }
        
        // Calculate total pages
        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            message: 'Berhasil mendapatkan data user',
            data: users,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalResults: count,
                limit: limit,
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error });
    }
}

module.exports = { listUser };