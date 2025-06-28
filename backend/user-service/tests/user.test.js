const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const testEmail = 'usertest@example.com';
const testPassword = 'Test1234!';
const testName = 'User Test';

let userId;
let token;

beforeAll(async () => {
  await User.deleteOne({ email: testEmail });

  const user = new User({
    email: testEmail,
    password: await require('bcryptjs').hash(testPassword, 10),
    name: testName,
    role: 'user',
  });
  await user.save();
  userId = user._id.toString();

  token = jwt.sign(
    { userId: userId, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
});

afterAll(async () => {
  await User.deleteOne({ email: testEmail });
});

describe('User Service API', () => {
  it('should get user profile', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', testEmail);
    expect(res.body).not.toHaveProperty('password');
  });

  it('should update user profile', async () => {
    const res = await request(app)
      .put('/api/user/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Profile updated');
  });

  it('should get user stats', async () => {
    const res = await request(app)
      .get('/api/user/me/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalScore');
    expect(res.body).toHaveProperty('quizzesCompleted');
  });

  it('should add score to user', async () => {
    const res = await request(app)
      .post(`/api/user/${userId}/score`)
      .send({ score: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalScore');
    expect(res.body).toHaveProperty('quizzesCompleted');
  });

  it('should return 404 for non-existing user', async () => {
    const res = await request(app)
      .get('/api/user/000000000000000000000000');
    expect(res.statusCode).toBe(404);
  });

  it('should not update password with wrong old password', async () => {
    const res = await request(app)
        .put('/api/user/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'WrongOldPassword', newPassword: 'NewTest123!' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Old password is incorrect/);
    });

  it('should update password with correct old password', async () => {
    const res = await request(app)
        .put('/api/user/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: testPassword, newPassword: 'NewTest123!' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Profile updated/);
    });

  it('should not reset password with invalid token', async () => {
    const res = await request(app)
        .post('/api/password/reset-password')
        .send({ token: 'invalidtoken', newPassword: 'AnotherTest123!' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid or expired token/);
    });

  it('should get user by id', async () => {
    const res = await request(app)
        .get(`/api/user/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', testEmail);
    });

  it('should not get profile without token', async () => {
    const res = await request(app)
        .get('/api/user/me');
    expect(res.statusCode).toBe(401);
    });
  
  it('should not allow access to profile with invalid token', async () => {
    const res = await request(app)
        .get('/api/user/me')
        .set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toBe(401);
    });

  it('should not update password to a weak one', async () => {
    const res = await request(app)
        .put('/api/user/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: testPassword, newPassword: '123' });
    expect(res.statusCode).toBe(400);
    });

  it('should return 200 even if email is missing in password reset request', async () => {
    const res = await request(app)
        .post('/api/password/request-password-reset')
        .send({});
    expect(res.statusCode).toBe(200);
    });

  it('should not reset password without token or new password', async () => {
    const res = await request(app)
        .post('/api/password/reset-password')
        .send({ newPassword: 'Test1234!' });
    expect(res.statusCode).toBe(400);
    });

  it('should not update profile if no data is sent', async () => {
    const res = await request(app)
        .put('/api/user/me')
        .set('Authorization', `Bearer ${token}`)
        .send({});
    expect(res.statusCode).toBe(200);
    });

  it('should not allow non-admin to get all users', async () => {
    const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
    });

  it('should not return password in user profile', async () => {
    const res = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${token}`);
    expect(res.body).not.toHaveProperty('password');
    });
});


// $ npm test -- tests/user.test.js

// > user-service@1.0.0 test
// > jest tests/user.test.js

//   console.log
//     Auth routes loaded

//       at Object.log (routes/password.js:8:9)

// (node:23516) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
// (Use `node --trace-deprecation ...` to show where the warning was created)
//   console.log
//     MongoDB connected

//       at log (../config/db.js:9:13)

//   console.log
//     User Service running on port 5002

//       at Server.log (app.js:36:34)

// PASS tests/user.test.js
//   User Service API
//     √ should get user profile (102 ms)
//     √ should update user profile (65 ms)
//     √ should get user stats (20 ms)
//     √ should add score to user (21 ms)
//     √ should return 404 for non-existing user (15 ms)
//     √ should not update password with wrong old password (133 ms)
//     √ should update password with correct old password (212 ms)
//     √ should not reset password with invalid token (10 ms)
//     √ should get user by id (12 ms)
//     √ should not get profile without token (7 ms)
//     √ should not allow access to profile with invalid token (7 ms)
//     √ should not update password to a weak one (98 ms)
//     √ should return 200 even if email is missing in password reset request (9 ms)
//     √ should not reset password without token or new password (5 ms)
//     √ should not update profile if no data is sent (15 ms)
//     √ should not allow non-admin to get all users (8 ms)
//     √ should not return password in user profile (9 ms)

// Test Suites: 1 passed, 1 total
// Tests:       17 passed, 17 total
// Snapshots:   0 total
// Time:        3.833 s, estimated 15 s
