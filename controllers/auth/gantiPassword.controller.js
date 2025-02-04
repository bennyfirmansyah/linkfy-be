const {Users} = require("../../models");
const bcrypt = require("bcrypt");

const gantiPassword = async (req, res) => {
    const userId = req.user.id
    const {password, confirmPassword} = req.body
    try {
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password dan konfirmasi password tidak sama"
            })
        }
        const user = await Users.findByPk(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        await user.update({password: hashedPassword})
        return res.json({
            message: "Berhasil mengganti password"
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

module.exports = {gantiPassword};