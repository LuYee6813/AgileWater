import bcrypt from 'bcrypt';
import type { Application } from 'express';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { startSerever } from '../../app';
import * as db from '../../config/db';
import { User } from '../../models/User';
import { WaterDispenser } from '../../models/WaterDispenser';

let mongoServer: MongoMemoryServer;

let app: Application;

const rev1 = [
  {
    sn: 1,
    username: 'testuser1',
    star: 3,
    content: '水很好喝',
    time: '2024-12-13T16:00:00.000Z',
    stolen: true
  },
  {
    sn: 2,
    username: 'testuser1',
    star: 3,
    content: '溫水出不來',
    time: '1989-06-04T12:00:00.000Z',
    stolen: true
  }
];
const rev2 = [
  {
    sn: 3,
    username: 'testuser2',
    star: 4,
    content: '極力推薦！',
    time: '2024-12-13T18:00:00.000Z',
    stolen: false
  },
  {
    sn: 4,
    username: 'testuser1',
    star: 5,
    content: '64',
    time: '2024-12-13T19:00:00.000Z',
    stolen: false
  }
];

const waterDispensersInfo = [
  {
    sn: 0,
    type: '飲水機',
    location: {
      type: 'Point',
      coordinates: [121.513152, 24.986225]
    },
    name: 'abcd',
    addr: 'abcdefg',
    iced: true,
    cold: true,
    warm: true,
    hot: true,
    openingHours: '00:00~00:00',
    rate: 3,
    reviews: rev1
  },
  {
    sn: 1,
    type: '飲水機',
    location: {
      type: 'Point',
      coordinates: [121.565418, 25.033976] // 經度, 緯度
    },
    name: 'efgh',
    addr: 'hijklmn',
    iced: false,
    cold: true,
    warm: false,
    hot: true,
    openingHours: '08:00~22:00',
    rate: 4,
    reviews: rev2
  }
];

const waterDispenserExpect = [
  {
    sn: 0,
    type: '飲水機',
    location: {
      lng: 121.513152,
      lat: 24.986225
    },
    name: 'abcd',
    addr: 'abcdefg',
    iced: true,
    cold: true,
    warm: true,
    hot: true,
    path: '',
    photos: [],
    openingHours: '00:00~00:00',
    rate: 3,
    reviews: rev1
  },
  {
    sn: 1,
    type: '飲水機',
    location: {
      lng: 121.565418,
      lat: 25.033976
    },
    name: 'efgh',
    addr: 'hijklmn',
    iced: false,
    cold: true,
    warm: false,
    hot: true,
    path: '',
    photos: [],
    openingHours: '08:00~22:00',
    rate: 4,
    reviews: rev2
  }
];

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

    await WaterDispenser.create(waterDispensersInfo);
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();

    vi.restoreAllMocks();
  });
  describe('GET /water_dispensers with user authorized', () => {
    it('should return 200 and all water dispenser informations', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .get('/water_dispensers')
        .set('Authorization', 'Bearer ' + token);
      expect(res.statusCode).toBe(200);
      expect(res.header['x-total-count']).toBe('2');

      const sortBySn = (a: { sn: number }, b: { sn: number }): number => a.sn - b.sn;
      const sortRes = res.body.sort(sortBySn);
      const sortExpect = waterDispenserExpect.sort(sortBySn);

      expect(sortRes).toEqual(sortExpect);
    });
  });

  describe('GET /water_dispensers with user unauthorized', () => {
    it('should return 401', async () => {
      const res = await request(app).get('/water_dispensers');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /water_dispensers/{sn} with user authorized', () => {
    it('should return 200 and the water dispenser information', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .get('/water_dispensers/0')
        .set('Authorization', 'Bearer ' + token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(waterDispenserExpect[0]);
    });
  });

  describe('GET /water_dispensers/{sn} with user unauthorized', () => {
    it('should return 401', async () => {
      const res = await request(app).get('/water_dispensers/0').set('Authorization', 'Bearer ');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /water_dispensers/{sn} with user authorized but water dispenser not exist', () => {
    it('should return 404', async () => {
      const token = jwt.sign({ username: 'testuser1' }, process.env.JWT_SECRET || '', {
        expiresIn: '1h'
      });
      const res = await request(app)
        .get('/water_dispensers/64')
        .set('Authorization', 'Bearer ' + token);
      expect(res.statusCode).toBe(404);
    });
  });
});
