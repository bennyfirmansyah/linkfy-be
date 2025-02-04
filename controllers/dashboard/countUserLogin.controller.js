const { Users } = require("../../models");
const Sequelize = require("sequelize");

const countUserLogin = async (req, res) => {
    try {
        const userWithUnit = await Users.findAll({
            attributes: [
                "unit",
                [Sequelize.fn("COUNT", Sequelize.col("*")), "count"],
            ],
            where: {
                role: "user",
            },
            group: ["unit"],
        });

        const totalUmum = await Users.count({
            where: {
                role: "umum",
            },
        });

        const userByUnit = {};
        let totalUser = 0;

        userWithUnit.forEach((data) => {
            const unit = data.unit;
            const count = parseInt(data.get("count"));
            userByUnit[unit] = count;
            totalUser += count;
        });

        return res.status(200).json({
            user: {
                total: totalUser,
                byUnit: userByUnit,
            },
            umum: totalUmum,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    countUserLogin,
};
