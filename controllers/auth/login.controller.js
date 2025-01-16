const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Users } = require("../../models");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = null;
        user = await Users.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                nama: user.nama,
                role: user.role, 
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );
        const refreshToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                nama: user.nama,
                role: user.role, 
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const isProduction = process.env.NODE_ENV;

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: isProduction ? "Strict" : "Lax",
        });
        res.json({
            message: "Login successful",
            accessToken,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            error: "Error logging in",
            details: error.message || "An unexpected error occurred",
        });
    }
};

module.exports = { login };