// routes/feedbacks.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Feedback = require('../models/Feedback');

/**
 * @swagger
 * tags:
 *   name: Feedbacks
 *   description: 反饋系統
 */

/**
 * @swagger
 * /feedbacks:
 *   post:
 *     summary: 提交反饋
 *     tags: [Feedbacks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - waterDispenserId
 *               - feedbackType
 *             properties:
 *               waterDispenserId:
 *                 type: string
 *                 description: 飲水機 ID
 *               feedbackType:
 *                 type: string
 *                 description: 反饋類型
 *               description:
 *                 type: string
 *                 description: 詳細描述
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 圖片 URL 列表
 *     responses:
 *       201:
 *         description: 反饋提交成功
 *       400:
 *         description: 請求錯誤
 */
router.post('/', auth, async (req, res) => {
  try {
    const { waterDispenserId, feedbackType, description, images } = req.body;
    const feedback = new Feedback({
      user: req.userId,
      waterDispenser: waterDispenserId,
      feedbackType,
      description,
      images,
    });
    await feedback.save();
    res.status(201).json({ message: '反饋提交成功', feedbackId: feedback._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
