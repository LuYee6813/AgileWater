const pool = require('../models/db');

// 獲取飲水機的所有評價
const getReviewsByStationSn = async (req, res) => {
    const { sn } = req.params;
    try {
        const result = await pool.query('SELECT * FROM reviews WHERE station_sn = $1', [sn]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
};

// 新增飲水機的評價
const addReview = async (req, res) => {
    const { sn } = req.params;
    const { star, content, name, img, cmnt_img } = req.body;

    if (!star || !content || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const query = `
            INSERT INTO reviews (station_sn, star, content, name, img, cmnt_img)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await pool.query(query, [sn, star, content, name, img, cmnt_img]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database insert failed' });
    }
};

module.exports = {
    getReviewsByStationSn,
    addReview,
};
