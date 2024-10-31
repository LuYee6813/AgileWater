// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 用戶認證
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 用戶註冊
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用戶名
 *               password:
 *                 type: string
 *                 description: 密碼
 *               nickname:
 *                 type: string
 *                 description: 暱稱
 *     responses:
 *       201:
 *         description: 註冊成功
 *       400:
 *         description: 請求錯誤
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    const user = new User({ username, password, nickname });
    await user.save();
    res.status(201).json({ message: '註冊成功' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用戶登入
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用戶名
 *               password:
 *                 type: string
 *                 description: 密碼
 *     responses:
 *       200:
 *         description: 登入成功
 *       400:
 *         description: 帳號或密碼錯誤
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('帳號或密碼錯誤');
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: '登入成功', token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
