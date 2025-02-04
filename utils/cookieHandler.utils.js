const handleSearchHistory = (req, res) => {
    const cookieName = "searchHistory";
    let searches = [];

    try {
        searches = JSON.parse(req.cookies[cookieName] || "[]");
        // Filter berdasarkan waktu dan hapus duplikat query
        const uniqueSearches = [];
        const seenQueries = new Set();
        
        searches
            .filter(s => new Date() - new Date(s.createdAt) < 24 * 60 * 60 * 1000)
            .forEach(search => {
                if (!seenQueries.has(search.query)) {
                    seenQueries.add(search.query);
                    uniqueSearches.push(search);
                }
            });
        
        searches = uniqueSearches;
    } catch (e) {
        searches = [];
    }

    return {
        get: () => searches,
        add: (query) => {
            // Hapus query yang sama jika sudah ada
            searches = searches.filter(s => s.query !== query);
            
            // Tambahkan query baru ke awal array
            searches.unshift({ query, createdAt: new Date() });
            
            // Batasi jumlah riwayat pencarian
            searches = searches.slice(0, 7);
            
            res.cookie(cookieName, JSON.stringify(searches), {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
        },
        remove: (query) => {
            searches = searches.filter(s => s.query !== query);
            res.cookie(cookieName, JSON.stringify(searches), {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
            return searches;
        }
    };
};

const handleClickHistory = (req, res) => {
    const cookieName = "clickHistory";
    let clicks = [];

    try {
        clicks = JSON.parse(req.cookies[cookieName] || "[]");
        clicks = clicks.filter(
            (c) => new Date() - new Date(c.createdAt) < 24 * 60 * 60 * 1000
        );
    } catch (e) {
        clicks = [];
    }

    return {
        get: () => clicks,
        add: (linkId) => {
            clicks.unshift({ linkId, createdAt: new Date() });
            res.cookie(cookieName, JSON.stringify(clicks), {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
        },
    };
};

module.exports = { handleSearchHistory, handleClickHistory };