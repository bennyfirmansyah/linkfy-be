const { Users, Links, ShareLink, Riwayat} = require('../../models');
const { Sequelize, Op } = require('sequelize');
const textVectorizer = require('../../utils/textVectorizer.utils');

const cariLink = async (req, res) => {
    const userId = req.user.id; 
    const page = Math.max(1, parseInt(req.query.page) || 1);  
    const limit = Math.max(1, parseInt(req.query.limit) || 10);  
    const offset = (page - 1) * limit;  
    const { q: searchQuery } = req.query;

    try {

        if (!searchQuery) {
            return res.status(400).json({ message: 'Query tidak valid' });
        }

        const queryVector = textVectorizer.generateVector(searchQuery, '').vector;

        await Riwayat.create({
            id_user : userId,
            query: searchQuery,
        });

        const links = await Links.findAll({
            offset,
            limit,
            attributes: ['id', 'judul', 'url', 'deskripsi', 'gambar', 'visibilitas', 'createdAt', 'vector'],
        });

        
        const results = links
            .map(link => {
                const linkVector = link.vector;  
                const similarity = textVectorizer.calculateSimilarity(queryVector, linkVector); 
                return { 
                    link,
                    similarity
                };
            })
            .filter(result => result.similarity > 0)
            .sort((a, b) => b.similarity - a.similarity);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Tidak ada link yang cocok ditemukan' });
        }

    

        const totalData = results.length;
        const totalPage = Math.ceil(totalData / limit);
        const paginatedResults = results.slice(offset, offset + limit).map(result => result.link);

        return res.json({
            status: true,
            message: "Data link berhasil didapatkan",
            totalData,
            totalPage,
            currentPage: page,
            data: paginatedResults
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

module.exports = { cariLink };