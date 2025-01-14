const { Sequelize } = require('sequelize');
const { Links, Users, ShareLink } = require('../../models');

const listLink = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    try {
        // Base query configuration
        const baseQueryConfig = {
            attributes: ['id', 'judul', 'url', 'deskripsi', 'gambar', 'visibilitas', 'createdAt'],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        };

        // ShareLink include configuration
        const shareLinkInclude = {
            model: ShareLink,
            required: false,
            attributes: ['id', 'id_user', 'id_link'],
            include: {
                model: Users,
                attributes: ['nama', 'email']
            },
            where: Sequelize.literal('"Links"."visibilitas" = \'private\'') 
        };

        // Query configuration based on role
        const queryConfig = role === 'admin' 
            ? {
                ...baseQueryConfig,
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['nama', 'email']
                    },
                    shareLinkInclude
                ]
            }
            : {
                ...baseQueryConfig,
                where: { id_user: userId },
                include: [shareLinkInclude]
            };

        const result = await Links.findAndCountAll(queryConfig);

        // Transform function for consistent data transformation
        const transformData = (link) => ({
            id: link.id,
            judul: link.judul,
            url: link.url,
            deskripsi: link.deskripsi,
            gambar: link.gambar,
            visibilitas: link.visibilitas,
            ...(role === 'admin' && {
                pembuat: {
                    nama: link.User.nama,
                    email: link.User.email
                }
            }),
            sharedWith: link.ShareLink ? link.ShareLink.map(share => ({
                id: share.id,
                user: {
                    nama: share.User.nama,
                    email: share.User.email
                }
            })) : []
        });

        const transformedResult = {
            totalData: result.count,
            totalPage: Math.ceil(result.count / limit),
            currentPage: page,
            data: result.rows.map(transformData)
        };

        return res.status(200).json({
            status: true,
            message: "Data link berhasil didapatkan",
            ...transformedResult
        });

    } catch (error) {
        console.error('Error in listLink:', error);
        return res.status(500).json({ 
            status: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { listLink };