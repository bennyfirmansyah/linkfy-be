const { Links, RiwayatLink } = require("../../models");

const terakhirDikunjungi = async (req, res) => {
    const userId = req.user?.id;
    const isLoggedIn = !!userId;

    try {
        if (isLoggedIn) {
            const allRiwayatLinks = await RiwayatLink.findAll({
                where: { id_user: userId },
                include: [
                    {
                        model: Links,
                        attributes: ["id", "judul", "url", "gambar"],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            const seenLinkIds = new Set();
            const uniqueRiwayatLinks = allRiwayatLinks.filter((item) => {
                const linkId = item.Link.id;
                if (seenLinkIds.has(linkId)) return false;
                seenLinkIds.add(linkId);
                return true;
            });

            return res.json({
                success: true,
                data: uniqueRiwayatLinks.slice(0, 5),
            });
        } else {
            // For non-logged in users, get from cookies
            const clickHistory = req.cookies.clickHistory
                ? JSON.parse(req.cookies.clickHistory)
                : [];

            // Get unique recent links
            const seenLinkIds = new Set();
            const uniqueLinks = clickHistory
                .filter((click) => {
                    if (seenLinkIds.has(click.linkId)) return false;
                    seenLinkIds.add(click.linkId);
                    return true;
                })
                .slice(0, 5);

            // Get link details
            const links = await Links.findAll({
                where: {
                    id: Array.from(seenLinkIds),
                    visibilitas: "public",
                },
                attributes: ["id", "judul", "url", "gambar"],
            });

            // Format response to match logged-in user format
            const formattedData = uniqueLinks
                .map((click) => ({
                    id_link: click.linkId,
                    createdAt: click.createdAt,
                    Link: links.find((l) => l.id === click.linkId),
                }))
                .filter((item) => item.Link); // Remove any links that weren't found or aren't public

            return res.json({
                success: true,
                data: formattedData,
            });
        }
    } catch (error) {
        console.error("Error in riwayatLink:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = { terakhirDikunjungi };
