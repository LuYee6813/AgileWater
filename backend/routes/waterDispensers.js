// routes/waterDispensers.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const WaterDispenser = require('../models/WaterDispenser');

/**
 * @swagger
 * tags:
 *   name: WaterDispensers
 *   description: 飲水機管理
 */

/**
 * @swagger
 * /waterdispensers:
 *   get:
 *     summary: 獲取飲水機列表
 *     tags: [WaterDispensers]
 *     parameters:
 *       - in: query
 *         name: hasHotWater
 *         schema:
 *           type: boolean
 *         description: 是否有熱水
 *       - in: query
 *         name: hasColdWater
 *         schema:
 *           type: boolean
 *         description: 是否有冷水
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 飲水機狀態
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: 經度
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: 緯度
 *       - in: query
 *         name: distance
 *         schema:
 *           type: number
 *         description: 最大距離（公尺）
 *     responses:
 *       200:
 *         description: 飲水機列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WaterDispenser'
 */
router.get('/', async (req, res) => {
  try {
    const { hasHotWater, hasColdWater, status, longitude, latitude, distance } = req.query;
    let query = {};

    // 篩選條件
    if (hasHotWater !== undefined) {
      query.hasHotWater = hasHotWater === 'true';
    }
    if (hasColdWater !== undefined) {
      query.hasColdWater = hasColdWater === 'true';
    }
    if (status) {
      query.status = status;
    }

    // 地理位置篩選
    if (longitude && latitude && distance) {
      query.location = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(distance),
        },
      };
    }

    const waterDispensers = await WaterDispenser.find(query);
    res.json(waterDispensers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /waterdispensers/{id}:
 *   get:
 *     summary: 獲取飲水機詳情
 *     tags: [WaterDispensers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飲水機 ID
 *     responses:
 *       200:
 *         description: 飲水機詳情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WaterDispenser'
 *       404:
 *         description: 飲水機未找到
 */
router.get('/:id', async (req, res) => {
  try {
    const waterDispenser = await WaterDispenser.findById(req.params.id).populate('reviews');
    if (!waterDispenser) {
      return res.status(404).json({ error: '飲水機未找到' });
    }
    res.json(waterDispenser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /waterdispensers:
 *   post:
 *     summary: 新增飲水機
 *     tags: [WaterDispensers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WaterDispenser'
 *     responses:
 *       201:
 *         description: 飲水機新增成功
 *       400:
 *         description: 請求錯誤
 */
router.post('/', auth, async (req, res) => {
  try {
    const waterDispenser = new WaterDispenser(req.body);
    await waterDispenser.save();
    res.status(201).json({ message: '飲水機新增成功' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /waterdispensers/{id}:
 *   put:
 *     summary: 更新飲水機信息
 *     tags: [WaterDispensers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飲水機 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WaterDispenser'
 *     responses:
 *       200:
 *         description: 飲水機更新成功
 *       400:
 *         description: 請求錯誤
 */
router.put('/:id', auth, async (req, res) => {
  try {
    await WaterDispenser.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: '飲水機更新成功' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /waterdispensers/{id}/images:
 *   post:
 *     summary: 上傳飲水機圖片
 *     tags: [WaterDispensers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飲水機 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 上傳的圖片文件
 *     responses:
 *       200:
 *         description: 圖片上傳成功
 *       400:
 *         description: 請求錯誤
 */
router.post('/:id/images', auth, upload.single('image'), async (req, res) => {
  try {
    const waterDispenser = await WaterDispenser.findById(req.params.id);
    waterDispenser.images.push('/' + req.file.path);
    await waterDispenser.save();
    res.json({ message: '圖片上傳成功' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /waterdispensers/nearby:
 *   get:
 *     summary: 獲取最近的飲水機
 *     tags: [WaterDispensers]
 *     parameters:
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: 經度
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: 緯度
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 返回的結果數量
 *     responses:
 *       200:
 *         description: 最近的飲水機列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WaterDispenser'
 *       400:
 *         description: 請求錯誤
 */
router.get('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, limit = 1 } = req.query;
    if (!longitude || !latitude) {
      return res.status(400).json({ error: '缺少經緯度參數' });
    }

    const waterDispensers = await WaterDispenser.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
        },
      },
    })
      .limit(parseInt(limit))
      .select('name location hasHotWater hasColdWater status')
      .lean();

    // 計算距離
    waterDispensers.forEach((wd) => {
      wd.distance = calculateDistance(latitude, longitude, wd.location.coordinates[1], wd.location.coordinates[0]);
    });

    res.json(waterDispensers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 計算兩點之間的距離（地球半徑約為 6371 公里）
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // 地球半徑（公尺）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = router;
