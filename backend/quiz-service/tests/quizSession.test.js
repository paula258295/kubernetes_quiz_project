const request = require('supertest');
const app = require('../app');
const QuizSession = require('../models/QuizSession');
const jwt = require('jsonwebtoken');
const connectDB = require('../../config/db');


const userId = '64b7e7e7e7e7e7e7e7e7e7e8';
const userToken = jwt.sign({ userId: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });

const quizId = '64b7e7e7e7e7e7e7e7e7e7e9';
let sessionId;

describe('Quiz Session API', () => {
  beforeAll(async () => {
    await connectDB();
    await QuizSession.deleteMany({ user: userId, quiz: quizId });
  });

  afterAll(async () => {
    await QuizSession.deleteMany({ user: userId, quiz: quizId });
  });

  it('should not allow unauthenticated user to start session', async () => {
    const res = await request(app)
      .post('/api/session/start')
      .send({ quizId });
    expect(res.statusCode).toBe(401);
  });

  it('should start session as authenticated user', async () => {
    const res = await request(app)
      .post('/api/session/start')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quizId });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('quiz', quizId);
    expect(res.body).toHaveProperty('user', userId);
    sessionId = res.body._id;
  });

  it('should return the same session if not finished', async () => {
    const res = await request(app)
      .post('/api/session/start')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quizId });
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(sessionId);
  });

  it('should not update finished session', async () => {
    await QuizSession.findByIdAndUpdate(sessionId, { finishedAt: new Date() });
    const res = await request(app)
      .patch(`/api/session/${sessionId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ answers: [{ question: 'q1', answer: 'a1' }] });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already finished/);
  });

  it('should return 404 for non-existing session on update', async () => {
    const fakeId = '64b7e7e7e7e7e7e7e7e7e7e0';
    const res = await request(app)
      .patch(`/api/session/${fakeId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ answers: [] });
    expect(res.statusCode).toBe(404);
  });

  it('should return 404 for non-existing session on finish', async () => {
    const fakeId = '64b7e7e7e7e7e7e7e7e7e7e1';
    const res = await request(app)
      .post('/api/session/finish')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ sessionId: fakeId, answers: [] });
    expect(res.statusCode).toBe(404);
  });

  it('should get my sessions', async () => {
    const res = await request(app)
      .get('/api/session/my')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get session by id', async () => {
    const res = await request(app)
      .get(`/api/session/${sessionId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', sessionId);
  });

  it('should return 404 for non-existing session on get', async () => {
    const fakeId = '64b7e7e7e7e7e7e7e7e7e7e2';
    const res = await request(app)
      .get(`/api/session/${fakeId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('should not allow unauthenticated user to get my sessions', async () => {
    const res = await request(app)
      .get('/api/session/my');
    expect(res.statusCode).toBe(401);
  });
});




// $ npm test -- tests/quizSession.test.js

// > quiz-service@1.0.0 test
// > jest tests/quizSession.test.js

// (node:7564) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
// (Use `node --trace-deprecation ...` to show where the warning was created)

//   console.log
//     Proxying /api/session app.js

//       at log (app.js:32:13)

// PASS tests/quizSession.test.js
//   Quiz Session API
//     √ should not allow unauthenticated user to start session (66 ms)
//     √ should start session as authenticated user (44 ms)
//     √ should return the same session if not finished (19 ms)
//     √ should not update finished session (20 ms)
//     √ should return 404 for non-existing session on update (14 ms)
//     √ should return 404 for non-existing session on finish (19 ms)
//     √ should get my sessions (30 ms)
//     √ should get session by id (20 ms)
//     √ should return 404 for non-existing session on get (13 ms)
//     √ should not allow unauthenticated user to get my sessions (7 ms)

// Test Suites: 1 passed, 1 total
// Tests:       10 passed, 10 total
// Snapshots:   0 total
// Time:        3.526 s, estimated 4 s
