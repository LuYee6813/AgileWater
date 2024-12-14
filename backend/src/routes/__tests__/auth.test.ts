import bcrypt from 'bcrypt';
import type { Application } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { startSerever } from '../../app';
import * as db from '../../config/db';
import { User } from '../../models/User';

let mongoServer: MongoMemoryServer;

let app: Application;

describe('auth', () => {
  beforeEach(async () => {
    process.env.JWT_SECRET = 'test';

    vi.spyOn(db, 'connectDB').mockImplementation(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      console.log('uri', uri);

      await mongoose.connect(uri);
    });

    app = await startSerever();

    const hashedPassword1 = await bcrypt.hash('password123', 10);
    await User.create({
      username: 'testuser1',
      password: hashedPassword1,
      nickname: 'Test User1',
      admin: false
    });
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();

    vi.restoreAllMocks();
  });

  describe('POST /auth/login with no payload', () => {
    it('should return 401 error', async () => {
      const res = await request(app).post('/auth/login');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /auth/login with valid account', () => {
    it('should return 200 and a token', async () => {
      const res = await request(app).post('/auth/login').send({
        username: 'admin',
        password: 'admin'
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('POST /auth/login with invalid username', () => {
    it('should return 401 error', async () => {
      const res = await request(app).post('/auth/login').send({
        username: 'invalid',
        password: 'admin'
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /auth/login with invalid password', () => {
    it('should return 401 error', async () => {
      const res = await request(app).post('/auth/login').send({
        username: 'admin',
        password: 'invalid'
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /register with valid payload', () => {
    it('should return 201 and the correct response body', async () => {
      const res = await request(app).post('/auth/register').send({
        username: 'testuser',
        password: 'password789',
        nickname: 'Test User'
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        username: 'testuser',
        nickname: 'Test User',
        admin: false
      });
    });
  });

  describe('POST /register with existing username', () => {
    it('should return 409 error', async () => {
      const res = await request(app).post('/auth/register').send({
        username: 'testuser1',
        password: 'password789',
        nickname: 'Test User'
      });
      expect(res.statusCode).toBe(409);
    });
  });

  describe('GET /this_is_not_a_valid_path', () => {
    it('should return 404 error', async () => {
      const res = await request(app).get('/this_is_not_a_valid_path');
      expect(res.statusCode).toBe(404);
    });
  });

  /*
  describe('POST /register with no payload', () => {
    it('should return 400 error', async () => {
      const res = await request(app).post('/auth/register');
      expect(res.statusCode).toBe(400);
    });
  });
  describe('POST /register with missing password', () => {
    it('should return 409 error', async () => {
      const res = await request(app).post('/auth/register').send({
        username: 'testuser',
        nickname: 'Test User',
      });
      expect(res.statusCode).toBe(401);
    });
  });
  */
});
