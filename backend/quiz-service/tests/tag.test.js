const request = require('supertest');
const app = require('../app');
const Tag = require('../models/Tag');
const jwt = require('jsonwebtoken');
const connectDB = require('../../config/db');


const userId = '64b7e7e7e7e7e7e7e7e7e7e8';
const userToken = jwt.sign({ userId: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });

let tagId;

describe('Tag API', () => {
  beforeAll(async () => {
    await connectDB();
    await Tag.deleteMany({ name: /Test Tag/ });
  });

  afterAll(async () => {
    await Tag.deleteMany({ name: /Test Tag/ });
  });

  it('should get all tags (public)', async () => {
    const res = await request(app).get('/api/tag');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should not allow unauthenticated user to create tag', async () => {
    const res = await request(app)
      .post('/api/tag')
      .send({ name: 'Test Tag 1' });
    expect(res.statusCode).toBe(401);
  });

  it('should create tag as authenticated user', async () => {
    const res = await request(app)
      .post('/api/tag')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Test Tag 1' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Test Tag 1');
    tagId = res.body._id;
  });

  it('should not allow unauthenticated user to delete tag', async () => {
    const res = await request(app)
      .delete(`/api/tag/${tagId}`);
    expect(res.statusCode).toBe(401);
  });

  it('should delete tag as authenticated user', async () => {
    const tag = await Tag.create({ name: 'Test Tag 2' });
    const res = await request(app)
      .delete(`/api/tag/${tag._id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Tag deleted');
  });

  it('should return 200 and message when deleting non-existing tag as authenticated user', async () => {
    const fakeId = '64b7e7e7e7e7e7e7e7e7e7e9';
    const res = await request(app)
      .delete(`/api/tag/${fakeId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Tag deleted');
  });
});





// $ npm test -- tests/tag.test.js

// > quiz-service@1.0.0 test
// > jest tests/tag.test.js

// (node:12208) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
// (Use `node --trace-deprecation ...` to show where the warning was created)
//   console.log
//     MongoDB connected

//       at log (../config/db.js:9:13)

// PASS tests/tag.test.js
//   Tag API
//     √ should get all tags (public) (58 ms)
//     √ should not allow unauthenticated user to create tag (25 ms)
//     √ should create tag as authenticated user (25 ms)
//     √ should not allow unauthenticated user to delete tag (7 ms)
//     √ should delete tag as authenticated user (19 ms)
//     √ should return 200 and message when deleting non-existing tag as authenticated user (11 ms)

// Test Suites: 1 passed, 1 total
// Tests:       6 passed, 6 total
// Snapshots:   0 total
// Time:        3.348 s
