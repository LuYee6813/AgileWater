import bcrypt from 'bcrypt';
import type { Application } from 'express';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { startSerever } from '../../app';
import * as db from '../../config/db';
import { User } from '../../models/User';

let mongoServer: MongoMemoryServer;

let app: Application;

describe('users', () => {
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
    const hashedPassword2 = await bcrypt.hash('password456', 10);
    await User.create({
      username: 'testuser1',
      password: hashedPassword1,
      nickname: 'Test User1',
      admin: false
    });
    await User.create({
      username: 'testuser2',
      password: hashedPassword2,
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

  describe('GET /users with user authorized', () => {
    const ExceptResponse = [
      { username: 'admin', nickname: 'Admin', admin: true },
      { username: 'testuser1', nickname: 'Test User1', admin: false },
      { username: 'testuser2', nickname: 'Test User1', admin: false }
    ];

    it('should return 200 and all user informations', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer ' + token);
      expect(res.statusCode).toBe(200);
      expect(res.header['x-total-count']).toBe('3');
      expect(res.body).toEqual(ExceptResponse);
    });
  });

  describe('GET /users with user unauthorized', () => {
    it('should return 401 error', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer ' + 'abc');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /users/current with user authorized', () => {
    it('should return 200', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });

      const res = await request(app)
        .get('/users/current')
        .set('Authorization', 'Bearer ' + token);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ username: 'testuser1', nickname: 'Test User1', admin: false });
    });
  });

  describe('POST /users/current with user unauthorized', () => {
    it('should return 401 error', async () => {
      const res = await request(app)
        .get('/users/current')
        .set('Authorization', 'Bearer ' + 'abc');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /users/{username} with user authorized and searching valid user', () => {
    it('should return 201 and the information of the user is asked', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .get('/users/testuser1')
        .set('Authorization', 'Bearer ' + token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ username: 'testuser1', nickname: 'Test User1', admin: false });
    });
  });

  describe('GET /users/{username} with user authorized and searching invalid user', () => {
    it('should return 201 and the information of the user is asked', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .get('/users/testuser3')
        .set('Authorization', 'Bearer ' + token);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /users/{username} with user unauthorized', () => {
    it('should return 401 error', async () => {
      const res = await request(app).get('/users/testuser1').set('Authorization', 'Bearer ');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /users with user authorized and admin', () => {
    it('should return 201 and the information of the new user', async () => {
      const token = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .post('/users')
        .set('Authorization', 'Bearer ' + token)
        .send({ username: 'admin2', password: 'admin2', nickname: 'Admin2', admin: true });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ username: 'admin2', nickname: 'Admin2', admin: true });
    });
  });

  describe('POST /users with user authorized but not admin', () => {
    it('should return 401 error', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .post('/users')
        .set('Authorization', 'Bearer ' + token)
        .send({ username: 'admin2', password: 'admin2', nickname: 'Admin2', admin: true });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /users with user unauthorized', () => {
    it('should return 401 error', async () => {
      const res = await request(app)
        .post('/users')
        .set('Authorization', 'Bearer ')
        .send({ username: 'admin2', password: 'admin2', nickname: 'Admin2', admin: true });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /users with user authorized and admin but user already exist', () => {
    it('should return 201 and the information of the new user', async () => {
      const token = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .post('/users')
        .set('Authorization', 'Bearer ' + token)
        .send({ username: 'admin', password: 'admin', nickname: 'Admin', admin: true });
      expect(res.statusCode).toBe(409);
    });
  });

  describe('PUT /users/{username} with user authorized and admin', () => {
    it('should return 200 and the information of the updated user', async () => {
      const token = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .put('/users/admin')
        .set('Authorization', 'Bearer ' + token)
        .send({
          password: 'admin2',
          nickname: 'Admin3',
          admin: true
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        username: 'admin',
        nickname: 'Admin3',
        admin: true
      });
    });
  });
  describe('PUT /users/{username} with user authorized but not admin changing his own informations', () => {
    it('should return 200 and changed informations', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .put('/users/testuser1')
        .set('Authorization', 'Bearer ' + token)
        .send({
          password: 'abcd1234',
          nickname: 'abcd',
          admin: false
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        username: 'testuser1',
        nickname: 'abcd',
        admin: false
      });
    });
  });

  describe('PUT /users/{username} with user authorized but not admin changing not his own informations', () => {
    it('should return 403 error', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .put('/users/admin')
        .set('Authorization', 'Bearer ' + token)
        .send({
          password: 'admin2',
          nickname: 'Admin3',
          admin: true
        });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /users/{username} with user unauthorized', () => {
    it('should return 401 error', async () => {
      const res = await request(app).put('/users/testuser1').send({
        password: 'abcd1234',
        nickname: 'abcd',
        admin: false
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /user/{username} with user authorized and admin but user not exist', () => {
    it('should return 404 error', async () => {
      const token = jwt.sign(
        {
          username: 'admin'
        },
        process.env.JWT_SECRET || '',
        {
          expiresIn: '1h'
        }
      );
      const res = await request(app)
        .put('/users/testuser3')
        .set('Authorization', 'Bearer ' + token)
        .send({
          password: 'abcd1234',
          nickname: 'abcd',
          admin: false
        });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /users/{username} with user authorized and admin', () => {
    it('should return 204', async () => {
      const token = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .delete('/users/testuser1')
        .set('Authorization', 'Bearer ' + token);
      expect(res.statusCode).toBe(204);
    });
  });

  describe('DELETE /users/{username} with user authorized but not admin deleting his own account', () => {
    it('should return 204', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .delete('/users/testuser1')
        .set('Authorization', 'Bearer ' + token);
      expect(res.statusCode).toBe(204);
    });
  });

  describe('DELETE /users/{username} with user authorized but not admin deleting other account', () => {
    it('should return 403 error', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .delete('/users/testuser2')
        .set('Authorization', 'Bearer ' + token);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /users/{username} with user unauthorized', () => {
    it('should return 401 error', async () => {
      const res = await request(app).delete('/users/testuser1');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('DELETE /users/{username} with user authorized and admin but user not exist', () => {
    it('should return 404 error', async () => {
      const token = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .delete('/users/testuser3')
        .set('Authorization', 'Bearer ' + token);
      expect(res.statusCode).toBe(404);
    });
  });
});
