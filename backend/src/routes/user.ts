import bcrypt from 'bcrypt';
import { Router } from 'express';

import { type AuthenticatedRequest, adminMiddleware, authMiddleware } from '../middlewares/auth';
import { User } from '../models/User';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError
} from '../utils/errorHandler';

const router: Router = Router();

// GET /users - Get all users (Admin Only)
router.get('/', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await User.find().select('-password -_id -__v');
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json(InternalServerError);
  }
});

// POST /users - Create a new user (Admin Only)
router.post('/', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  const { username, password, nickname, admin } = req.body;

  if (!username || !password || !nickname) {
    res.status(400).json({ ...BadRequestError, message: 'Missing required fields' });
    return;
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(409).json({ ...ConflictError, message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      nickname,
      admin
    });
    await newUser.save();

    res.status(201).json({
      username: newUser.username,
      nickname: newUser.nickname,
      admin: newUser.admin
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(InternalServerError);
  }
});

// PUT /users/:username - Update user (Admin or User Self Only)
router.put('/:username', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { username } = req.params;
  const { password, nickname, admin } = req.body;
  const requester = req.user; // Assume user is attached to req

  if (!requester?.admin && requester?.username !== username) {
    res.status(403).json(ForbiddenError);
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (nickname) updateData.nickname = nickname;
    if (requester.admin && admin !== undefined) updateData.admin = admin;

    const updatedUser = await User.findOneAndUpdate({ username }, updateData, {
      new: true
    });
    if (!updatedUser) {
      res.status(404).json({ ...NotFoundError, message: 'User not found' });
      return;
    }

    res.status(200).json({
      username: updatedUser.username,
      nickname: updatedUser.nickname,
      admin: updatedUser.admin
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(InternalServerError);
  }
});

// DELETE /users/:username - Delete user (Admin or User Self Only)
router.delete('/:username', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { username } = req.params;
  const requester = req.user;

  if (!requester?.admin && requester?.username !== username) {
    res.status(403).json(ForbiddenError);
    return;
  }

  try {
    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser) {
      res.status(404).json({ ...NotFoundError, message: 'User not found' });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json(InternalServerError);
  }
});

export default router;
