import bcrypt from 'bcrypt';
import express, { type Router } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../models/User';
import { ConflictError, UnauthorizedError } from '../utils/errorHandler';

const router: Router = express.Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ ...UnauthorizedError, message: 'Invalid username or password' });
    return;
  }

  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET || '', {
    expiresIn: '1h'
  });
  res.json({ token });
});

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, password, nickname } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.status(409).json({ ...ConflictError, message: 'User already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    username,
    password: hashedPassword,
    nickname
  });
  res.status(201).json({
    username: newUser.username,
    nickname: newUser.nickname,
    admin: newUser.admin
  });
});

export default router;
