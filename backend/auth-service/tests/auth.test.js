const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

const testEmail = 'test@example.com';
const testPassword = 'Test1234!';
const testName = 'Test User';

beforeAll(async () => {
  await User.deleteOne({ email: testEmail });
});

afterAll(async () => {
  await User.deleteOne({ email: testEmail });
});


describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: testName,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/User registered/);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testEmail);
  });

  it('should not register user with existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: testName,
      });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/Email already registered/);
  });

  it('should not register user with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'another@example.com',
        password: 'short',
        name: testName,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].msg).toMatch(/Password must be at least 8 characters long/);
  });

  it('should not register user with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: testPassword,
        name: testName,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].msg).toMatch(/valid email/);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testEmail);
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword123!',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid credentials/);
  });

  it('should not login with non-existing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'notfound@example.com',
        password: testPassword,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid credentials/);
  });
});




// $ npm test

// > auth-service@1.0.0 test
// > jest

//   console.log
//     MongoDB connected

//       at log (../config/db.js:9:13)

//   console.log
//     Auth Service running on port 5003

//       at Server.log (app.js:72:34)

// PASS tests/auth.test.js
//   Auth API
//     √ should register a new user (195 ms)
//     √ should not register user with existing email (14 ms)
//     √ should not register user with invalid password (8 ms)
//     √ should not register user with invalid email (6 ms)
//     √ should login with correct credentials (93 ms)
//     √ should not login with wrong password (90 ms)
//     √ should not login with non-existing email (9 ms)

// Test Suites: 1 passed, 1 total
// Tests:       7 passed, 7 total
// Snapshots:   0 total
// Time:        3.778 s, estimated 4 s
