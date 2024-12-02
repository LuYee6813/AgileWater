const pool = require('../models/db');

// 獲取所有飲水機座標和基本資訊
const getWaterStations = async (req, res) => {
    try {
        const result = await pool.query('SELECT sn, lat, lng, name, type, access FROM water_stations');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
};

// 獲取指定飲水機的詳細資訊
const getWaterStationBySn = async (req, res) => {
    const { sn } = req.params;
    try {
        const result = await pool.query('SELECT * FROM water_stations WHERE sn = $1', [sn]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Water station not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
};

// 基於座標查詢附近的飲水機
const getNearbyWaterStations = async (req, res) => {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng || !radius) {
        return res.status(400).json({ error: 'lat, lng, and radius are required' });
    }

    try {
        const query = `
            SELECT sn, name, lat, lng, type, access,
                   ST_DistanceSphere(ST_MakePoint($1, $2), ST_MakePoint(lng, lat)) AS distance
            FROM water_stations
            WHERE ST_DistanceSphere(ST_MakePoint($1, $2), ST_MakePoint(lng, lat)) <= $3
            ORDER BY distance;
        `;
        const result = await pool.query(query, [lng, lat, radius]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
};

// 新增飲水機座標和相關資訊
const addWaterStation = async (req, res) => {
    const {
        sn,
        name,
        addr,
        type,
        iced,
        cold,
        warm,
        hot,
        lat,
        lng,
        access,
        phone,
        photo,
        photo_multi,
        opening_hours,
        description,
        offers,
        service,
        score,
        check_in,
        visit,
    } = req.body;

    if (!sn || !lat || !lng || !name) {
        return res.status(400).json({ error: 'Missing required fields (sn, lat, lng, name)' });
    }

    try {
        const query = `
            INSERT INTO water_stations (
                sn, name, addr, type, iced, cold, warm, hot, lat, lng, access, phone, photo,
                photo_multi, opening_hours, description, offers, service, score, check_in, visit
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                $14, $15, $16, $17, $18, $19, $20, $21
            )
            RETURNING *;
        `;

        const result = await pool.query(query, [
            sn, name, addr, type, iced, cold, warm, hot, lat, lng, access, phone, photo,
            photo_multi, opening_hours, description, offers, service, score, check_in, visit,
        ]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database insert failed' });
    }
};

module.exports = {
    getWaterStations,
    getWaterStationBySn,
    getNearbyWaterStations,
    addWaterStation,
};
