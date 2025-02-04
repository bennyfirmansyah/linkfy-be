const { Feedbacks } = require("../../models");

const tambahFeedback = async (req, res) => {
    const userId = req.user?.id;
    const { feedback } = req.body;
    try {
        if (!feedback) {
            return res.status(400).json({
                success: false,
                message: "Feedback tidak boleh kosong",
            });
        }
        if (userId) {
            await Feedbacks.create({
                id_user: userId,
                feedback,
            });
        } else {
            await Feedbacks.create({
                feedback,
            });
        }
        return res.json({
            message: "Berhasil menambahkan feedback",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = { tambahFeedback };
