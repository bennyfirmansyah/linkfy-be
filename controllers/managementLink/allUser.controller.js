const { Users } = require("../../models");
const { Op, where } = require("sequelize");

const allUser = async (req, res) => {
    const userId = req.user.id;
    const search = req.query.search || "";
    const unit = req.query.unit || "";
    try {
        const whereClause = {
            id: {
                [Op.ne]: userId,
            },
            nama: {
                [Op.iLike]: `%${search}%`,
            },
        };

        if (unit) {
            whereClause.unit = unit;
        }

        const user = await Users.findAll({
            where: {
                ...whereClause,
                role: {
                    [Op.in]: ["admin", "user"]
                }
            },
            attributes: { 
                exclude: [
                    "password"
                ] 
            },
            order: [["nama", "ASC"]],
        });

        return res.json({
            message: user.length > 0 ? "Berhasil mendapatkan data user" : "Data user tidak ditemukan",
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = { allUser };