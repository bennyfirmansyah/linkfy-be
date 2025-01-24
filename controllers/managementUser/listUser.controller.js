const { Users } = require('../../models');
const { Op } = require('sequelize');

const listUser = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const unit = req.query.unit || "";

    try {
        const whereCluse = {
            [Op.or]: [
                {
                    nama: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    email: {
                        [Op.iLike]: `%${search}%`
                    }
                }
            ]
        };

        if (unit) {
            whereCluse.unit = unit;
        }

        const { count, rows: users } = await Users.findAndCountAll({
            where: {
                role : ['user', 'umum'],
                ...whereCluse
            },
            attributes: ['id', 'email', 'nama', 'role', 'unit', 'createdAt'],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']] 
        });

        // Calculate total pages
        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            message: count > 0 ? 'Berhasil mendapatkan data user' : 'Data user tidak ditemukan',
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
        console.error('Error in listUser:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
}

module.exports = { listUser };