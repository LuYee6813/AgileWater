import type { Application } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { startSerever } from '../../app';
import * as db from '../../config/db';

let mongoServer: MongoMemoryServer;

let app: Application;

describe('auth', () => {
  beforeAll(async () => {
    vi.spyOn(db, 'connectDB').mockImplementation(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      console.log('uri', uri);

      await mongoose.connect(uri);
    });

    app = await startSerever();
  });

  afterAll(async () => {
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

  describe('POST /auth/login with admin account', () => {
    it('should return a token', async () => {
      const res = await request(app).post('/auth/login').send({
        username: 'admin',
        password: 'admin'
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });
});
