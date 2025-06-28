const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let adminToken;
let userToken;
let adminEmail = `admin+${Date.now()}@example.com`;
let userEmail = `usertest+${Date.now()}@example.com`;
let testPassword = 'Test1234!';

describe('User Service API - Admin endpoints', () => {
  beforeAll(async () => {
    await User.deleteOne({ email: adminEmail });
    await User.deleteOne({ email: userEmail });

    const admin = new User({
      email: adminEmail,
      password: await require('bcryptjs').hash(testPassword, 10),
      name: 'Admin',
      role: 'admin',
    });
    await admin.save();
    adminToken = jwt.sign(
      { userId: admin._id.toString(), role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const user = new User({
      email: userEmail,
      password: await require('bcryptjs').hash(testPassword, 10),
      name: 'User',
      role: 'user',
    });
    await user.save();
    userToken = jwt.sign(
      { userId: user._id.toString(), role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    await User.deleteOne({ email: adminEmail });
    await User.deleteOne({ email: userEmail });
  });

  it('should allow admin to get all users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should not allow normal user to get all users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('should not allow access without token', async () => {
    const res = await request(app)
      .get('/api/admin/users');
    expect(res.statusCode).toBe(401);
  });

  it('should not allow access with invalid token', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toBe(401);
  });
});




// $ npm test -- tests/admin.test.js

// > user-service@1.0.0 test
// > jest tests/admin.test.js

//   console.log
//     Auth routes loaded

//       at Object.log (routes/password.js:8:9)

// (node:14400) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
// (Use `node --trace-deprecation ...` to show where the warning was created)
//   console.log
//     MongoDB connected

//       at log (../config/db.js:9:13)

//   console.log
//     User Service running on port 5002

//       at Server.log (app.js:36:34)

// PASS tests/admin.test.js
//   User Service API - Admin endpoints
//     √ should allow admin to get all users (44 ms)
//     √ should not allow normal user to get all users (10 ms)
//     √ should not allow access without token (6 ms)
//     √ should not allow access with invalid token (9 ms)

// Test Suites: 1 passed, 1 total
// Tests:       4 passed, 4 total
// Snapshots:   0 total
// Time:        3.159 s, estimated 15 s
