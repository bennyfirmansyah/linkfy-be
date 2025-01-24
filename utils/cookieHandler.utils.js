const handleSearchHistory = (req, res) => {
    const cookieName = "searchHistory";
    let searches = [];

    try {
        searches = JSON.parse(req.cookies[cookieName] || "[]");
        searches = searches.filter(
            (s) => new Date() - new Date(s.createdAt) < 24 * 60 * 60 * 1000
        );
    } catch (e) {
        searches = [];
    }

    return {
        get: () => searches,
        add: (query) => {
            searches.unshift({ query, createdAt: new Date() });
            searches = searches.slice(0, 7);
            res.cookie(cookieName, JSON.stringify(searches), {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
        },
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
