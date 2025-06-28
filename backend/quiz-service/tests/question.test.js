const request = require('supertest');
const app = require('../app');
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');
const connectDB = require('../../config/db');

const adminId = '64b7e7e7e7e7e7e7e7e7e7e7';
const userId = '64b7e7e7e7e7e7e7e7e7e7e8';
const adminToken = jwt.sign({ userId: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
const userToken = jwt.sign({ userId: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });

let questionId;
const quizId = '64b7e7e7e7e7e7e7e7e7e7e9';

describe('Question API', () => {
  beforeAll(async () => {
    await connectDB();
    await Question.deleteMany({ text: /Test Question/ });
  });

  afterAll(async () => {
    await Question.deleteMany({ text: /Test Question/ });
  });

  it('should not allow unauthenticated user to create question', async () => {
    const res = await request(app)
      .post('/api/question')
      .send({
        quiz: quizId,
        type: 'single',
        text: 'Test Question 1',
        points: 2,
      });
    expect(res.statusCode).toBe(401);
  });

  it('should create question as authenticated user', async () => {
    const res = await request(app)
      .post('/api/question')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        quiz: quizId,
        type: 'single',
        text: 'Test Question 1',
        points: 2,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('question');
    expect(res.body.question).toHaveProperty('text', 'Test Question 1');
    questionId = res.body.question._id;
  });

  it('should not create question with missing fields', async () => {
    const res = await request(app)
      .post('/api/question')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        quiz: quizId,
        type: 'single',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should get all questions', async () => {
    const res = await request(app).get('/api/question');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get questions for a quiz', async () => {
    const res = await request(app).get(`/api/question/quiz/${quizId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('quiz', quizId);
    }
  });

  it('should update question as authenticated user', async () => {
    const res = await request(app)
      .put(`/api/question/${questionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ text: 'Test Question 1 Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('text', 'Test Question 1 Updated');
  });

  it('should not allow unauthenticated user to update question', async () => {
    const res = await request(app)
      .put(`/api/question/${questionId}`)
      .send({ text: 'Should Not Update' });
    expect(res.statusCode).toBe(401);
  });

  it('should delete question as authenticated user', async () => {
    const res = await request(app)
      .delete(`/api/question/${questionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Question deleted');
  });

  it('should not allow unauthenticated user to delete question', async () => {
    const q = await Question.create({
      quiz: quizId,
      type: 'single',
      text: 'Test Question 2',
      points: 1,
    });
    const res = await request(app)
      .delete(`/api/question/${q._id}`);
    expect(res.statusCode).toBe(401);
  });

  it('should return 404 when updating non-existing question', async () => {
    const fakeId = '64b7e7e7e7e7e7e7e7e7e7e0';
    const res = await request(app)
      .put(`/api/question/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ text: 'Should Not Update' });
    expect(res.statusCode).toBe(404);
  });
});



// $ npm test -- tests/question.test.js

// > quiz-service@1.0.0 test
// > jest tests/question.test.js

// (node:11972) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
// (Use `node --trace-deprecation ...` to show where the warning was created)
//   console.log
//     MongoDB connected

//       at log (../config/db.js:9:13)

// PASS tests/question.test.js
//   Question API
//     √ should not allow unauthenticated user to create question (57 ms)
//     √ should create question as authenticated user (44 ms)
//     √ should not create question with missing fields (14 ms)
//     √ should get all questions (23 ms)
//     √ should get questions for a quiz (10 ms)
//     √ should update question as authenticated user (17 ms)
//     √ should not allow unauthenticated user to update question (13 ms)
//     √ should delete question as authenticated user (19 ms)
//     √ should not allow unauthenticated user to delete question (16 ms)
//     √ should return 404 when updating non-existing question (18 ms)

// Test Suites: 1 passed, 1 total
// Tests:       10 passed, 10 total
// Snapshots:   0 total
// Time:        3.801 s, estimated 4 s
