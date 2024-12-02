const express = require('express');
const router = express.Router();
const {
    getWaterStations,
    getWaterStationBySn,
    getNearbyWaterStations,
    addWaterStation,
} = require('../controllers/waterController');
const { getReviewsByStationSn, addReview } = require('../controllers/reviewController');

// 飲水機相關路由
router.get('/water_stations', getWaterStations);
router.get('/water_stations/:sn', getWaterStationBySn);
router.get('/water_stations/nearby', getNearbyWaterStations);
router.post('/water_stations', addWaterStation);

// 評價相關路由
router.get('/water_stations/:sn/reviews', getReviewsByStationSn);
router.post('/water_stations/:sn/reviews', addReview);

module.exports = router;
