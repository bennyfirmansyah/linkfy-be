const logout = async (req, res) => {
    try {
        // Hapus refresh token dari cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        });
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

module.exports = {logout};