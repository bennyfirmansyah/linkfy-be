const { Sequelize } = require('sequelize');
const { Links } = require('../../models');

const countLink = async (req, res) => {
    // Verifikasi role admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            status: false,
            message: 'Unauthorized access. Admin role required.'
        });
    }

    try {
        // Mendapatkan statistik berdasarkan kategori
        const categoryStats = await Links.findAll({
            attributes: [
                'kategori',
                'visibilitas',
                [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
            ],
            group: ['kategori', 'visibilitas'],
            order: [
                ['kategori', 'ASC'],
                ['visibilitas', 'ASC']
            ]
        });

        // Mengorganisir data untuk respons
        const statsMap = {};
        
        categoryStats.forEach(stat => {
            const category = stat.kategori || 'uncategorized';
            if (!statsMap[category]) {
                statsMap[category] = {
                    total: 0,
                    public: 0,
                    private: 0
                };
            }
            
            statsMap[category][stat.visibilitas] = parseInt(stat.get('count'));
            statsMap[category].total += parseInt(stat.get('count'));
        });

        // Menghitung total keseluruhan
        const totals = {
            total: 0,
            public: 0,
            private: 0
        };

        Object.values(statsMap).forEach(stat => {
            totals.total += stat.total;
            totals.public += stat.public;
            totals.private += stat.private;
        });

        return res.status(200).json({
            status: true,
            message: "Berhasil mendapatkan statistik dashboard",
            data: {
                categoryStats: statsMap,
                totals
            }
        });

    } catch (error) {
        console.error('Error in countLink:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { countLink };