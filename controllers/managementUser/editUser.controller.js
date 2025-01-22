const { Users } = require('../../models');

const editUser = async (req, res) => {
    const { userId } = req.params;
    const { email, nama, unit, role } = req.body;

    try {
        const user = await Users.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!email || !nama || !role) {
            return res.status(400).json({ message: 'Semua field harus diisi' });
        }

        // Validasi email gmail
        if (!email.endsWith('@gmail.com')) {
            return res.status(400).json({ message: 'Email harus menggunakan domain @gmail.com' });
        }

        user.email = email;
        user.nama = nama;
        user.unit = unit;
        user.role = role;

        await user.save();

        return res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error in editUser:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
}

module.exports = { editUser };