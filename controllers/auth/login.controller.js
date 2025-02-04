const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const { Users } = require("../../models");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Buat OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

// Fungsi untuk generate URL login Google
const getGoogleAuthURL = () => {
    const scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
    ];

    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: scopes,
    });
};

const generateTokens = (user) => {
    const tokenPayload = {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
        unit: user.unit,
    };

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });
    const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: "7d",
    });

    return { accessToken, refreshToken };
};

const setCookieOptions = (isProduction) => ({
    httpOnly: true,
    secure: isProduction === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: isProduction === "production" ? "Strict" : "Lax",
});

// Login dengan email dan password
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Users.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Password salah" });
        }

        const { accessToken, refreshToken } = generateTokens(user);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        };
        
        res.clearCookie('searchHistory', cookieOptions);
        res.clearCookie('clickHistory', cookieOptions);

        res.cookie(
            "refreshToken",
            refreshToken,
            setCookieOptions(process.env.NODE_ENV)
        );
        res.json({
            message: "Login berhasil",
            accessToken,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            error: "Gagal login",
            details: error.message,
        });
    }
};

// Endpoint untuk mendapatkan URL login Google
const getGoogleURL = (req, res) => {
    res.json({ url: getGoogleAuthURL() });
};

// Callback handler untuk OAuth Google
const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        // Dapatkan tokens dari code
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Gunakan tokens untuk mendapatkan informasi user
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: "v2",
        });

        const { data } = await oauth2.userinfo.get();

        // Cari atau buat user
        let user = await Users.findOne({ where: { email: data.email } });

        if (user) {
            // Update informasi Google jika belum ada
            if (!user.googleId) {
                await user.update({
                    googleId: data.id,
                    authProvider: "google",
                });
            }
        } else {
            // Buat user baru
            user = await Users.create({
                email: data.email,
                nama: data.name,
                googleId: data.id,
                authProvider: "google",
                role: "umum",
                password: await bcrypt.hash(Math.random().toString(36), 10),
            });
        }

        const { accessToken, refreshToken } = generateTokens(user);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        };

        res.clearCookie('searchHistory', cookieOptions);
        res.clearCookie('clickHistory', cookieOptions);

        res.cookie(
            "refreshToken",
            refreshToken,
            setCookieOptions(process.env.NODE_ENV)
        );

        res.redirect(
            `${process.env.CORS_ORIGIN}/auth/google/success?token=${accessToken}`
        );
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.redirect(`${process.env.CORS_ORIGIN}/login`);
    }
};

module.exports = { login, getGoogleURL, googleCallback };
