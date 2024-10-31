// routes/reviews.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Review = require('../models/Review');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: 評論管理
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: 新增評論
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - waterDispenser
 *               - rating
 *             properties:
 *               waterDispenser:
 *                 type: string
 *                 description: 飲水機 ID
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 評分
 *               comment:
 *                 type: string
 *                 description: 評論內容
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 圖片 URL 列表
 *     responses:
 *       201:
 *         description: 評論新增成功
 *       400:
 *         description: 請求錯誤
 */
router.post('/', auth, async (req, res) => {
  try {
    const review = new Review({
      ...req.body,
      user: req.userId,
    });
    await review.save();
    res.status(201).json({ message: '評論新增成功' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /reviews/waterdispenser/{id}:
 *   get:
 *     summary: 獲取特定飲水機的評論
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 飲水機 ID
 *     responses:
 *       200:
 *         description: 評論列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: string
 *                     description: 使用者暱稱
 *                   rating:
 *                     type: integer
 *                     description: 評分
 *                   comment:
 *                     type: string
 *                     description: 評論內容
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: 評論時間
 *       400:
 *         description: 請求錯誤
 */
router.get('/waterdispenser/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ waterDispenser: req.params.id }).populate('user', 'nickname');
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
