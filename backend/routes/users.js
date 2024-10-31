// routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const User = require('../models/User');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 用戶管理
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 獲取用戶信息
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 用戶 ID
 *     responses:
 *       200:
 *         description: 用戶信息
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: 無權限
 */
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: '無權限' });
    }
    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: 更新用戶信息
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 用戶 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 暱稱
 *               avatar:
 *                 type: string
 *                 description: 頭像 URL
 *     responses:
 *       200:
 *         description: 更新成功
 *       403:
 *         description: 無權限
 */
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: '無權限' });
    }
    const updates = req.body;
    await User.findByIdAndUpdate(req.params.id, updates);
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
