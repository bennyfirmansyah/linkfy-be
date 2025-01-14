const bcrypt =require('bcrypt');
const { Users } = require('../../models');

const tambahUser = async (req, res) => {
    const {email, nama, password, role} = req.body;
    console.log(req.body);
    try {
        if (!email || !password || !role || !nama ) {
            return res.status(400).json({message: 'Semua field harus diisi'});
        }
        const userExists = await Users.findOne({where: {email}});
        if (userExists) {
            return res.status(400).json({message: 'User sudah ada'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Users.create({
            email: email, 
            nama: nama, 
            password: hashedPassword, 
            role: role
        });
        res.status(201).json({message: 'User berhasil ditambahkan'});
    } catch (error) {
        return res.status(500).json({message: 'Internal server error', error});
    }
}

module.exports = {tambahUser};
