const logout = async (req, res) => {
    try {
        // Hapus multiple cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        };

        res.clearCookie('refreshToken', cookieOptions);
        res.clearCookie('searchHistory', cookieOptions);
        res.clearCookie('clickHistory', cookieOptions);

        res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({
            error: "Error during logout",
            details: error.message || "An unexpected error occurred"
        });
    }
};

module.exports = {
    logout
};