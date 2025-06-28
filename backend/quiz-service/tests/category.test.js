const request = require('supertest');
const app = require('../app');
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');
const connectDB = require('../../config/db');

const adminId = '64b7e7e7e7e7e7e7e7e7e7e7'; 
const userId = '64b7e7e7e7e7e7e7e7e7e7e8';
const adminToken = jwt.sign({ userId: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
const userToken = jwt.sign({ userId: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });

let categoryId;

describe('Category API', () => {
  beforeAll(async () => {
    await connectDB();
    await Category.deleteMany({ name: /Test Category/ });
    });

  afterAll(async () => {
    await Category.deleteMany({ name: /Test Category/ });
  });

  it('should get all categories (public)', async () => {
    const res = await request(app).get('/api/category');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should not allow non-admin to create category', async () => {
    const res = await request(app)
      .post('/api/category')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Test Category 1' });
    expect(res.statusCode).toBe(403);
  });

  it('should not allow unauthenticated user to create category', async () => {
    const res = await request(app)
      .post('/api/category')
      .send({ name: 'Test Category 1' });
    expect(res.statusCode).toBe(401);
  });

  it('should create category as admin', async () => {
    const res = await request(app)
      .post('/api/category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Category 1' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Test Category 1');
    categoryId = res.body._id;
  });

  it('should update category as admin', async () => {
    const res = await request(app)
      .put(`/api/category/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Category 1 Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test Category 1 Updated');
  });

  it('should not allow non-admin to update category', async () => {
    const res = await request(app)
      .put(`/api/category/${categoryId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Should Not Update' });
    expect(res.statusCode).toBe(403);
  });

  it('should not allow unauthenticated user to update category', async () => {
    const res = await request(app)
      .put(`/api/category/${categoryId}`)
      .send({ name: 'Should Not Update' });
    expect(res.statusCode).toBe(401);
  });

  it('should delete category as admin', async () => {
    const res = await request(app)
      .delete(`/api/category/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Category deleted');
  });

  it('should not allow non-admin to delete category', async () => {
    const cat = await Category.create({ name: 'Test Category 2' });
    const res = await request(app)
      .delete(`/api/category/${cat._id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('should not allow unauthenticated user to delete category', async () => {
    const cat = await Category.create({ name: 'Test Category 3' });
    const res = await request(app)
      .delete(`/api/category/${cat._id}`);
    expect(res.statusCode).toBe(401);
  });

  it('should return 200 and message when deleting non-existing category as admin', async () => {
    const fakeId = '64b7e7e7e7e7e7e7e7e7e7e9';
    const res = await request(app)
      .delete(`/api/category/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Category deleted');
  });
});



// $  npm test -- tests/category.test.js

// > quiz-service@1.0.0 test
// > jest tests/category.test.js

// (node:21940) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
// (Use `node --trace-deprecation ...` to show where the warning was created)
//   console.log
//     MongoDB connected

//       at log (../config/db.js:9:13)

// PASS tests/category.test.js
//   Category API
//     √ should get all categories (public) (112 ms)
//     √ should not allow non-admin to create category (89 ms)
//     √ should not allow unauthenticated user to create category (9 ms)
//     √ should create category as admin (45 ms)
//     √ should update category as admin (35 ms)
//     √ should not allow non-admin to update category (18 ms)
//     √ should not allow unauthenticated user to update category (10 ms)
//     √ should delete category as admin (21 ms)
//     √ should not allow non-admin to delete category (25 ms)
//     √ should not allow unauthenticated user to delete category (14 ms)
//     √ should return 200 and message when deleting non-existing category as admin (19 ms)

// Test Suites: 1 passed, 1 total
// Tests:       11 passed, 11 total
// Snapshots:   0 total
// Time:        3.826 s, estimated 14 s
