const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken; 
  
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }
  
    try {
      jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).json({ error: "Invalid or expired refresh token" });
        }
  
        // Jika refresh token valid, buat access token baru
        const newAccessToken = jwt.sign(
          {
            id: user.id,
            email: user.email,
            nama: user.nama,
            role: user.role, 
          },
          JWT_SECRET,
          { expiresIn: "1d" } // Access token berlaku 1 jam
        );
  
        res.json({ accessToken: newAccessToken });
      });
  
    } catch (error) {
      console.error("Refresh Token Error:", error);
      res.status(500).json({
        error: "Error refreshing access token",
        details: error.message || "An unexpected error occurred",
      });
    }
};

module.exports = {refreshAccessToken};