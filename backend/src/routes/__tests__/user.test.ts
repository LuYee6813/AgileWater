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

    describe('GET /users with no user authorized', () => {
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

    describe('POST /users/current with no user authorized', () => {
        it('should return 401 error', async () => {
            const res = await request(app)
                .get('/users/current')
                .set('Authorization', 'Bearer ' + 'abc');
            expect(res.statusCode).toBe(401);
        });
    });
});
