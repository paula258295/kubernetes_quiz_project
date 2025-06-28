const request = require('supertest');
const app = require('../app');
const Quiz = require('../models/Quiz');
const jwt = require('jsonwebtoken');
const connectDB = require('../../config/db');

const adminId = '64b7e7e7e7e7e7e7e7e7e7e7';
const userId = '64b7e7e7e7e7e7e7e7e7e7e8';
const userToken = jwt.sign({ userId: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });

let quizId;
const categoryId = '64b7e7e7e7e7e7e7e7e7e7e9';

describe('Quiz API', () => {
  beforeAll(async () => {
    await connectDB();
    await Quiz.deleteMany({ title: /Test Quiz/ });
  });

  afterAll(async () => {
    await Quiz.deleteMany({ title: /Test Quiz/ });
  });

  it('should not allow unauthenticated user to create quiz', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .send({
        title: 'Test Quiz 1',
        category: categoryId,
        difficulty: 'easy',
        duration: 10,
      });
    expect(res.statusCode).toBe(401);
  });

  it('should create quiz as authenticated user', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Test Quiz 1',
        category: categoryId,
        difficulty: 'easy',
        duration: 10,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('quiz');
    expect(res.body.quiz).toHaveProperty('title', 'Test Quiz 1');
    quizId = res.body.quiz._id;
  });

  it('should not create quiz with missing fields', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        difficulty: 'easy',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should get all quizzes (paginated)', async () => {
    const res = await request(app).get('/api/quiz');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.quizzes)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('pages');
  });

  it('should get quiz by id', async () => {
    const res = await request(app).get(`/api/quiz/${quizId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title', 'Test Quiz 1');
  });

  it('should update quiz as owner', async () => {
    const res = await request(app)
      .put(`/api/quiz/${quizId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Test Quiz 1 Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.quiz).toHaveProperty('title', 'Test Quiz 1 Updated');
  });

  it('should not allow unauthenticated user to update quiz', async () => {
    const res = await request(app)
      .put(`/api/quiz/${quizId}`)
      .send({ title: 'Should Not Update' });
    expect(res.statusCode).toBe(401);
  });

  it('should get quiz points', async () => {
    const res = await request(app).get(`/api/quiz/${quizId}/points`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalPoints');
  });

  it('should get public quizzes', async () => {
    const res = await request(app).get('/api/quiz/public');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.quizzes)).toBe(true);
  });

  it('should get my quizzes as owner', async () => {
    const res = await request(app)
      .get('/api/quiz/my')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.quizzes)).toBe(true);
  });

  it('should delete quiz as owner', async () => {
    const res = await request(app)
      .delete(`/api/quiz/${quizId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Quiz deleted');
  });

  it('should not allow unauthenticated user to delete quiz', async () => {
    const quiz = await Quiz.create({
      title: 'Test Quiz 3',
      category: categoryId,
      difficulty: 'easy',
      duration: 10,
      owner: userId,
    });
    const res = await request(app)
      .delete(`/api/quiz/${quiz._id}`);
    expect(res.statusCode).toBe(401);
  });

  it('should return 404 when updating non-existing quiz', async () => {
    const fakeId = '64b7e7e7e7e7e7e7e7e7e7e0';
    const res = await request(app)
      .put(`/api/quiz/${fakeId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Should Not Update' });
    expect(res.statusCode).toBe(404);
  });

  it('should return 404 when deleting non-existing quiz', async () => {
    const fakeId = '64b7e7e7e7e7e7e7e7e7e7e1';
    const res = await request(app)
      .delete(`/api/quiz/${fakeId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(404);
  });
});




// $ npm test -- tests/quiz.test.js

// > quiz-service@1.0.0 test
// > jest tests/quiz.test.js

// (node:9900) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
// (Use `node --trace-deprecation ...` to show where the warning was created)
//   console.log
//     MongoDB connected

//       at log (../config/db.js:9:13)

// PASS tests/quiz.test.js
//   Quiz API
//     √ should not allow unauthenticated user to create quiz (53 ms)
//     √ should create quiz as authenticated user (43 ms)
//     √ should not create quiz with missing fields (11 ms)
//     √ should get all quizzes (paginated) (23 ms)
//     √ should get quiz by id (10 ms)
//     √ should update quiz as owner (17 ms)
//     √ should not allow unauthenticated user to update quiz (12 ms)
//     √ should get quiz points (9 ms)
//     √ should get public quizzes (14 ms)
//     √ should get my quizzes as owner (15 ms)
//     √ should delete quiz as owner (13 ms)
//     √ should not allow unauthenticated user to delete quiz (9 ms)
//     √ should return 404 when updating non-existing quiz (17 ms)
//     √ should return 404 when deleting non-existing quiz (9 ms)

// Test Suites: 1 passed, 1 total
// Tests:       14 passed, 14 total
// Snapshots:   0 total
// Time:        3.493 s, estimated 4 s
